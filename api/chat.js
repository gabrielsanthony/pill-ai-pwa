// /api/chat.js
// Vercel Node serverless function (Assistants v2 + project-aware headers)

/* 🔒 Domain guard: allow only medicine-related questions */
const MED_KEYWORDS = [
  'medicine','medicines','medication','medications','drug','drugs',
  'dose','dosing','dosage','side effect','side effects','adverse effect','adverse effects',
  'interact','interaction','interactions','contraindication','contraindications',
  'tablet','capsule','syrup','inhaler','antibiotic','painkiller','analgesic',
  'prescription','rx','over the counter','otc',
  'pregnancy','breastfeeding','lactation','storage','with food','on empty stomach',
  'missed dose','overdose','cmi','consumer medicine information','medsafe',
  'new zealand formulary','nz formulary','pharmac'
];

const OFF_TOPIC_HINTS = [
  'capital of','recipe','how to cook','weather','population',
  'currency of','president of','lyrics','movie plot'
];

function normalizeText(s = '') {
  return String(s)
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function isMedicineQuestion(q = '') {
  const text = normalizeText(q);
  if (!text || text.length < 3) return false;
  if (OFF_TOPIC_HINTS.some(h => text.includes(h))) return false;
  if (MED_KEYWORDS.some(k => text.includes(k))) return true;
  if (/^what (should|can) i take for /.test(text)) return true;
  if (/^can i take .* with /.test(text)) return true;
  return false;
}
function looksMedicineAnswer(s = '') {
  const t = normalizeText(s);
  if (!t) return false;
  if (OFF_TOPIC_HINTS.some(h => t.includes(h))) return false;
  if (MED_KEYWORDS.some(k => t.includes(k))) return true;
  if (t.includes('pill ai only answers questions about medicines using medsafe consumer medicine information')) return true;
  return false;
}
function stripInlineCitations(s = '') {
  return String(s)
    .replace(/\s*[【\[][^】\]\n]{1,120}[】\]]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
function tidyStyle(s = '') {
  let out = String(s).replace(/\r/g, '');
  out = out.replace(/\n[^\n]*what to do\s*:\s*/i, '\n\n');
  out = out
    .replace(/^\s*(✅|📌|⚠️|👉|🔹|•|\*|–|—)\s*/gm, '')
    .replace(/(✅|📌|⚠️|👉|🔹)/g, '');
  out = out.replace(/^\s*(key points?|what to do|safety first)\s*:\s*/gim, '');
  out = out.replace(/([:.!?])\s*-\s+/g, '$1\n- ');
  out = out.replace(/\s+-\s+(?=[A-Za-z(])/g, '\n- ');
  out = out.replace(/-\s+/g, '- ');
  out = out.replace(/\n{3,}/g, '\n\n');
  out = out.replace(/\n(?!-|\n)/g, ' ');
  out = out.replace(/[ \t]+/g, ' ').trim();
  out = out.replace(/\s*source:\s*/i, '\nSource: ');
  return out;
}

// Build headers for all OpenAI calls (Assistants v2 + optional project)
function buildHeaders(apiKey, projectId, includeJson = true) {
  return {
    ...(includeJson ? { 'Content-Type': 'application/json' } : {}),
    'Authorization': `Bearer ${apiKey}`,
    'OpenAI-Beta': 'assistants=v2',
    ...(projectId ? { 'OpenAI-Project': projectId } : {})
  };
}

// helper: always return something displayable (JSON path)
function sendAnswer(res, text) {
  return res.status(200).json({ answer: text });
}

// helper: early-exit for the streaming path
function endStream(res, text) {
  if (!res.headersSent) {
    res.writeHead(200, {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    });
  }
  if (text) res.write(text);
  try { res.end(); } catch {}
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.ASSISTANT_ID;   // asst_...
  const projectId = process.env.OPENAI_PROJECT_ID || '';

  // detect stream=1 in the query or URL
  const wantStream =
    (req.query && String(req.query.stream).toLowerCase() === '1') ||
    (req.url && /\bstream=1\b/.test(req.url));

  if (!apiKey || !assistantId) {
    const msg = '⚠️ Pill-AI server is not configured (missing API key or Assistant ID).';
    return wantStream ? endStream(res, msg) : sendAnswer(res, msg);
  }

  const body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const language = typeof body.language === 'string' ? body.language : 'English';
  if (question.length < 3) {
    return wantStream ? endStream(res, 'Please send a valid question') : res.status(400).json({ error: 'Please send a valid question' });
  }

  if (!isMedicineQuestion(question)) {
    const refusal =
      "Pill-AI only answers medicine questions using NZ Medsafe Consumer Medicine Information.\n" +
      "Try asking things like:\n" +
      "• “What’s the usual adult dose of amoxicillin?”\n" +
      "• “Can ibuprofen be taken with paracetamol?”\n" +
      "• “Common side effects of sertraline?”\n" +
      "• “What should I do if I miss a dose of metformin?”";
    return wantStream ? endStream(res, refusal) : sendAnswer(res, refusal);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    // 0) check assistant exists
    const asstRes = await fetch(`https://api.openai.com/v1/assistants/${assistantId}`, {
      headers: buildHeaders(apiKey, projectId, false)
    });
    if (!asstRes.ok) {
      const msg = '⚠️ Pill-AI setup issue: Assistant not found for this API key/project.';
      return wantStream ? endStream(res, msg) : sendAnswer(res, msg);
    }

    // a) create thread
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: buildHeaders(apiKey, projectId, true),
      body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
      signal: controller.signal,
    });
    if (!threadRes.ok) {
      const msg = '⚠️ Pill-AI error creating conversation (threads.create).';
      return wantStream ? endStream(res, msg) : sendAnswer(res, msg);
    }
    const thread = await threadRes.json();

    // b) start run
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: buildHeaders(apiKey, projectId, true),
      body: JSON.stringify({
        assistant_id: assistantId,
        additional_instructions: `
Answer in ${language}. Use plain text only (no emojis, no headings).
Structure:
1) Brief 1–2 sentence summary.
2) If you need a list, use one-line "- " bullets (max 6).
3) Optionally end with: "Source: Medsafe Consumer Medicine Information."
Do NOT include inline citation markers such as [4:10], [1], etc.
`,
      }),
      signal: controller.signal,
    });
    if (!runRes.ok) {
      const msg = '⚠️ Pill-AI error starting the run (runs.create).';
      return wantStream ? endStream(res, msg) : sendAnswer(res, msg);
    }
    const run = await runRes.json();

// === STREAMING BRANCH ===
if (wantStream) {
  res.writeHead(200, {
    'Content-Type': 'text/plain; charset=utf-8',
    'Cache-Control': 'no-cache, no-transform',
    'Connection': 'keep-alive',
    'X-Accel-Buffering': 'no',
  });

  let status = run.status;
  let attempts = 0;

  // Track how much CLEANED text we've already sent
  let lastCleanLen = 0;

  // helper: read all assistant text so far (raw)
  const readAssistantText = async () => {
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages?limit=50&order=asc`,
      { headers: buildHeaders(apiKey, projectId, false), signal: controller.signal }
    );
    const list = await msgRes.json();
    const texts = (list.data || [])
      .filter(m => m.role === 'assistant')
      .flatMap(m =>
        (m.content || [])
          .filter(c => c.type === 'text')
          .map(c => c.text?.value || '')
      );
    return texts.join('\n\n');
  };

  while (status === 'queued' || status === 'in_progress' || status === 'requires_action') {
    // gentle poll
    await new Promise(r => setTimeout(r, 700));
    attempts++;
    if (attempts > 180) {
      res.write('\n\n⚠️ (Timeout — please try again.)');
      return res.end();
    }

    // 1) Pull everything so far
    let soFar = '';
    try {
      soFar = await readAssistantText();
    } catch (_) {
      // ignore transient read errors
    }

    // 2) Clean it (remove inline citations, tidy bullets/spacing)
    const cleanedSoFar = tidyStyle(stripInlineCitations(soFar));

    // 3) Stream only the new cleaned delta
    if (cleanedSoFar.length > lastCleanLen) {
      res.write(cleanedSoFar.slice(lastCleanLen));
      lastCleanLen = cleanedSoFar.length;
    }

    // 4) Check run status
    const check = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
      { headers: buildHeaders(apiKey, projectId, false), signal: controller.signal }
    );
    const runState = await check.json();
    status = runState.status;
    if (status === 'failed' || status === 'cancelled' || status === 'expired') {
      res.write(`\n\n⚠️ Run ${status}.`);
      return res.end();
    }
  }

  clearTimeout(timeout);
  return res.end();
}

    // === NON-STREAMING BRANCH (original JSON response) ===
    // poll until complete
    let status = run.status;
    let attempts = 0;
    while (status === 'queued' || status === 'in_progress' || status === 'requires_action') {
      await new Promise(r => setTimeout(r, 800));
      attempts++;
      if (attempts > 120) return sendAnswer(res, '⚠️ Pill-AI run timed out. Please try again.');
      const check = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        { headers: buildHeaders(apiKey, projectId, false), signal: controller.signal }
      );
      const runState = await check.json();
      status = runState.status;
      if (status === 'failed' || status === 'cancelled' || status === 'expired') {
        return sendAnswer(res, `⚠️ Pill-AI run ${status}.`);
      }
    }
    clearTimeout(timeout);

    // read final messages
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages?limit=50&order=asc`,
      { headers: buildHeaders(apiKey, projectId, false) }
    );
    if (!msgRes.ok) return sendAnswer(res, '⚠️ Pill-AI error reading messages.');

    const list = await msgRes.json();
    const assistantTexts = (list.data || [])
      .filter(m => m.role === 'assistant')
      .flatMap(m => (m.content || [])
        .filter(c => c.type === 'text')
        .map(c => c.text?.value || '')
        .filter(Boolean)
      );

    const answer = assistantTexts.length ? assistantTexts[assistantTexts.length - 1].trim() : '';
    const REFUSAL = 'Sorry — Pill-AI only answers questions about medicines using Medsafe Consumer Medicine Information.';

    if (answer) {
      if (!looksMedicineAnswer(answer)) return sendAnswer(res, REFUSAL);
      const cleaned = tidyStyle(stripInlineCitations(answer));
      return sendAnswer(res, cleaned);
    }

    return sendAnswer(res, '⚠️ No response received.');
  } catch (err) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') return wantStream ? endStream(res, '⚠️ Request timed out.') : sendAnswer(res, '⚠️ Pill-AI server request timed out.');
    return wantStream ? endStream(res, '⚠️ Unexpected server error.') : sendAnswer(res, '⚠️ Unexpected server error.');
  }
}
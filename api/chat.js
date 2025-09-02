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
  if (t.includes('pill ai only answers questions about medicines using medsafe consumer medicine information')) {
    return true;
  }
  return false;
}

function stripInlineCitations(s = '') {
  return String(s)
    // remove citation-like bracketed chunks
    .replace(/\s*[【\[][^】\]\n]{1,120}[】\]]/g, '')
    // collapse excessive spaces/newlines
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
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

// helper: always return something displayable
function sendAnswer(res, text) {
  return res.status(200).json({ answer: text });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.ASSISTANT_ID;   // asst_...
  const projectId = process.env.OPENAI_PROJECT_ID || ''; // optional proj_...
  if (!apiKey || !assistantId) {
    console.error('[chat] Missing env', { hasKey: !!apiKey, hasAssistant: !!assistantId, projectId });
    return sendAnswer(res, '⚠️ Pill-AI server is not configured (missing API key or Assistant ID).');
  }

  const body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const language = typeof body.language === 'string' ? body.language : 'English';
  if (question.length < 3) {
    return res.status(400).json({ error: 'Please send a valid question' });
  }

  if (!isMedicineQuestion(question)) {
    console.log('[chat] GATE: blocked off-topic →', question);
    return sendAnswer(
      res,
      "Pill-AI only answers medicine questions using NZ Medsafe Consumer Medicine Information.\n" +
      "Try asking things like:\n" +
      "• “What’s the usual adult dose of amoxicillin?”\n" +
      "• “Can ibuprofen be taken with paracetamol?”\n" +
      "• “Common side effects of sertraline?”\n" +
      "• “What should I do if I miss a dose of metformin?”"
    );
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 60_000);

  try {
    // 0) Preflight: verify the assistant is visible with this key+project
    const asstRes = await fetch(
      `https://api.openai.com/v1/assistants/${assistantId}`,
      { headers: buildHeaders(apiKey, projectId, false) }
    );
    if (!asstRes.ok) {
      const t = await asstRes.text().catch(() => '');
      console.error('[chat] assistant.get failed', asstRes.status, t);
      return sendAnswer(res, '⚠️ Pill-AI setup issue: Assistant not found for this API key/project. Create the API key in the same OpenAI Project as the Assistant.');
    }

    // a) Create a thread with the user's question
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: buildHeaders(apiKey, projectId, true),
      body: JSON.stringify({ messages: [{ role: 'user', content: question }] }),
      signal: controller.signal,
    });
    if (!threadRes.ok) {
      const t = await threadRes.text().catch(() => '');
      console.error('[chat] threads.create failed', threadRes.status, t);
      return sendAnswer(res, '⚠️ Pill-AI error creating conversation (threads.create).');
    }
    const thread = await threadRes.json();

    // b) Run the assistant on that thread
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: buildHeaders(apiKey, projectId, true),
      body: JSON.stringify({
        assistant_id: assistantId,
        additional_instructions: `
Answer in ${language}. Be concise and friendly. Use at most 6 short bullets total.

Format like this (omit a section if not relevant):
✅ Key points:
- ...
📌 What to do:
- ...

Do NOT include any inline citation markers such as [4:10†file.txt], [1], or .
If helpful, end with one plain line: "Source: Medsafe Consumer Medicine Information."
`,
      }),
      signal: controller.signal,
    });
    if (!runRes.ok) {
      const t = await runRes.text().catch(() => '');
      console.error('[chat] runs.create failed', runRes.status, t);
      return sendAnswer(res, '⚠️ Pill-AI error starting the run (runs.create).');
    }
    const run = await runRes.json();

    // c) Poll until complete
    let status = run.status;
    let attempts = 0;
    while (status === 'queued' || status === 'in_progress' || status === 'requires_action') {
      await new Promise(r => setTimeout(r, 800));
      attempts++;
      if (attempts > 120) {
        console.error('[chat] run polling timed out');
        return sendAnswer(res, '⚠️ Pill-AI run timed out. Please try again.');
      }
      const check = await fetch(
        `https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`,
        { headers: buildHeaders(apiKey, projectId, false), signal: controller.signal }
      );
      const runState = await check.json();
      status = runState.status;
      if (status === 'failed' || status === 'cancelled' || status === 'expired') {
        console.error('[chat] run ended', status, runState.last_error || '');
        return sendAnswer(res, `⚠️ Pill-AI run ${status}.`);
      }
    }
    console.log('[chat] run completed');

    clearTimeout(timeout);

    // d) Read messages (asc so last assistant text is latest)
    const msgRes = await fetch(
      `https://api.openai.com/v1/threads/${thread.id}/messages?limit=50&order=asc`,
      { headers: buildHeaders(apiKey, projectId, false) }
    );
    if (!msgRes.ok) {
      const t = await msgRes.text().catch(() => '');
      console.error('[chat] messages.list failed', msgRes.status, t);
      return sendAnswer(res, '⚠️ Pill-AI error reading messages.');
    }
    const list = await msgRes.json();

    const assistantTexts = (list.data || [])
      .filter(m => m.role === 'assistant')
      .flatMap(m =>
        (m.content || [])
          .filter(c => c.type === 'text')
          .map(c => c.text?.value || '')
          .filter(Boolean)
      );

    const answer = assistantTexts.length ? assistantTexts[assistantTexts.length - 1].trim() : '';
    const REFUSAL =
      'Sorry — Pill-AI only answers questions about medicines using Medsafe Consumer Medicine Information.';

if (answer) {
  if (!looksMedicineAnswer(answer)) {
    console.warn('[chat] Post-guard replaced off-topic output.');
    return sendAnswer(res, REFUSAL);
  }
  const cleaned = stripInlineCitations(answer);
  console.log('[chat] answer length (cleaned):', cleaned.length);
  return sendAnswer(res, cleaned);
}

    console.warn('[chat] No assistant text content.');
    return sendAnswer(res, '⚠️ No response received.');
  } catch (err) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') {
      console.error('[chat] Request timed out');
      return sendAnswer(res, '⚠️ Pill-AI server request timed out.');
    }
    console.error('[chat] Unexpected error:', err);
    return sendAnswer(res, '⚠️ Unexpected server error.');
  }
}
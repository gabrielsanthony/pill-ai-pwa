// /api/chat.js
// Vercel Node serverless function (Assistants API version)

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

// quick blocklist for common off-topic asks that slipped through
const OFF_TOPIC_HINTS = [
  'capital of','recipe','how to cook','weather','population',
  'currency of','president of','lyrics','movie plot'
];

// normalize text for safer substring checks
function normalizeText(s = '') {
  return String(s)
    .toLowerCase()
    // replace punctuation with space (unicode aware)
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    // collapse multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

/** Returns true if the question looks medication-related */
function isMedicineQuestion(q = '') {
  const text = normalizeText(q);
  if (!text || text.length < 3) return false;

  // explicit off-topic hints → reject early
  if (OFF_TOPIC_HINTS.some(h => text.includes(h))) return false;

  // domain keywords → allow
  if (MED_KEYWORDS.some(k => text.includes(k))) return true;

  // patterns (normalized)
  if (/^what (should|can) i take for /.test(text)) return true;
  if (/^can i take .* with /.test(text)) return true;

  return false;
}

/** Returns true if the model's draft looks medication-related (or is our exact refusal) */
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

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1) Env & input validation
  const apiKey = process.env.OPENAI_API_KEY;
  const assistantId = process.env.ASSISTANT_ID; // <-- set in Vercel (asst_...)
  if (!apiKey || !assistantId) {
    console.error('[chat] Missing env', { hasKey: !!apiKey, hasAssistant: !!assistantId });
    return res.status(500).json({ error: 'Server not configured' });
  }

  const body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const language = typeof body.language === 'string' ? body.language : 'English';
  // const simplify = Boolean(body.simplify); // not used with Assistants, kept for future

  if (question.length < 3) {
    return res.status(400).json({ error: 'Please send a valid question' });
  }

  // 2) SERVER GUARD: refuse non-medicine questions
  if (!isMedicineQuestion(question)) {
    console.log('[chat] GATE: blocked off-topic →', question);
    return res.status(200).json({
      answer:
        "Pill-AI only answers medicine questions using NZ Medsafe Consumer Medicine Information.\n" +
        "Try asking things like:\n" +
        "• “What’s the usual adult dose of amoxicillin?”\n" +
        "• “Can ibuprofen be taken with paracetamol?”\n" +
        "• “Common side effects of sertraline?”\n" +
        "• “What should I do if I miss a dose of metformin?”"
    });
  }

  // 3) Assistants API (uses your attached File Search + Vector Store)
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40_000);

  try {
    // a) create a thread with the user's question
    const threadRes = await fetch('https://api.openai.com/v1/threads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: question }],
      }),
      signal: controller.signal,
    });
    if (!threadRes.ok) {
      const t = await threadRes.text().catch(() => '');
      console.error('[chat] threads.create failed', threadRes.status, t);
      return res.status(502).json({ error: 'OpenAI threads.create failed' });
    }
    const thread = await threadRes.json();

    // b) run the assistant on that thread
    const runRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        assistant_id: assistantId,
        additional_instructions: `Answer in ${language}. Be concise, use ≤6 bullets when helpful, and follow Pill-AI's safety-first style.`,
      }),
      signal: controller.signal,
    });
    if (!runRes.ok) {
      const t = await runRes.text().catch(() => '');
      console.error('[chat] runs.create failed', runRes.status, t);
      return res.status(502).json({ error: 'OpenAI runs.create failed' });
    }
    const run = await runRes.json();

    // c) poll until complete
    let status = run.status;
    let attempts = 0;
    while (status === 'queued' || status === 'in_progress' || status === 'requires_action') {
      await new Promise(r => setTimeout(r, 800));
      attempts++;
      if (attempts > 120) {
        console.error('[chat] run polling timed out');
        return res.status(504).json({ error: 'OpenAI run timeout' });
      }
      const check = await fetch(`https://api.openai.com/v1/threads/${thread.id}/runs/${run.id}`, {
        headers: { 'Authorization': `Bearer ${apiKey}` },
        signal: controller.signal,
      });
      const runState = await check.json();
      status = runState.status;
      if (status === 'failed' || status === 'cancelled' || status === 'expired') {
        console.error('[chat] run ended', status, runState.last_error || '');
        return res.status(502).json({ error: `OpenAI run ${status}` });
      }
    }

    clearTimeout(timeout);

    // d) read the latest assistant message
    const msgRes = await fetch(`https://api.openai.com/v1/threads/${thread.id}/messages?limit=5&order=desc`, {
      headers: { 'Authorization': `Bearer ${apiKey}` },
    });
    if (!msgRes.ok) {
      const t = await msgRes.text().catch(() => '');
      console.error('[chat] messages.list failed', msgRes.status, t);
      return res.status(502).json({ error: 'OpenAI messages.list failed' });
    }
    const list = await msgRes.json();
    const assistantMsg = (list.data || []).find(m => m.role === 'assistant');

    const parts = (assistantMsg?.content || [])
      .filter(c => c.type === 'text')
      .map(c => c.text?.value || '')
      .join('\n')
      .trim();

    const answer = parts || '';
    const REFUSAL = 'Sorry — Pill-AI only answers questions about medicines using Medsafe Consumer Medicine Information.';

    // 4) POST-GUARD: if the assistant freelances off-topic, replace with refusal
    if (answer) {
      if (!looksMedicineAnswer(answer)) {
        console.warn('[chat] Post-guard replaced off-topic output.');
        return res.status(200).json({ answer: REFUSAL });
      }
      return res.status(200).json({ answer });
    }

    console.warn('[chat] No assistant text content.');
    return res.status(200).json({ answer: '⚠️ No response received.' });

  } catch (err) {
    clearTimeout(timeout);
    if (err?.name === 'AbortError') {
      console.error('[chat] Request timed out');
      return res.status(504).json({ error: 'OpenAI timeout' });
    }
    console.error('[chat] Unexpected error:', err);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
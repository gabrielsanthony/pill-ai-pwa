// /api/chat.js
// Vercel Node serverless function (keep this in the repo root under /api).
// Uses a safer default model and adds input validation, timeouts, and robust error handling.

const DEFAULT_MODEL = process.env.OPENAI_MODEL || 'gpt-4o-mini'; // you can override in Vercel

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // 1) Env & input validation
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    console.error('[chat] Missing OPENAI_API_KEY');
    return res.status(500).json({ error: 'Server not configured' });
  }

  let body = req.body || {};
  const question = typeof body.question === 'string' ? body.question.trim() : '';
  const language = typeof body.language === 'string' ? body.language : 'English';
  const simplify = Boolean(body.simplify);

  if (question.length < 3) {
    return res.status(400).json({ error: 'Please send a valid question' });
  }

  // 2) Build messages
  const system = `You are a helpful New Zealand medicine assistant.
Always be clear and concise, and prefer NZ consumer information sources (e.g., Medsafe CMI).
Answer in ${language}.
If safety-critical, remind the user to consult a pharmacist or doctor.`;

  // 3) Timeout guard
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000); // 25s

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: DEFAULT_MODEL,                 // modern small model
        temperature: simplify ? 0.3 : 0.7,   // steadier if simplify=true
        max_tokens: 400,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: question },
        ],
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    // 4) Non-OK → pass useful info
    if (!openaiRes.ok) {
      let errText = '';
      try { errText = await openaiRes.text(); } catch {}
      console.error('[chat] OpenAI HTTP', openaiRes.status, errText);
      const friendly = openaiRes.status === 401
        ? 'Invalid API key'
        : openaiRes.status === 429
          ? 'Rate limited'
          : 'Upstream error';
      return res.status(502).json({ error: `OpenAI ${friendly}` });
    }

    // 5) Parse safely
    let data;
    try {
      data = await openaiRes.json();
    } catch (parseErr) {
      console.error('[chat] JSON parse error:', parseErr);
      return res.status(502).json({ error: 'OpenAI invalid JSON' });
    }

    const answer = data?.choices?.[0]?.message?.content;
    if (typeof answer === 'string' && answer.trim()) {
      return res.status(200).json({ answer: answer.trim() });
    }

    console.warn('[chat] No answer in payload:', JSON.stringify(data).slice(0, 500));
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
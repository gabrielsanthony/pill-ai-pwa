// /api/wa/webhook.js
// Meta Webhooks verification + basic POST parser (scaffold for MVP)
// In production: lock down with a verify token env var and signature checks.

const VERIFY_TOKEN = process.env.WA_VERIFY_TOKEN || 'pillai-dev-token';

export default async function handler(req, res) {
  try {
    // 1) Verify webhook (Meta does GET with hub.challenge)
    if (req.method === 'GET') {
      const mode = req.query['hub.mode'];
      const token = req.query['hub.verify_token'];
      const challenge = req.query['hub.challenge'];

      if (mode === 'subscribe' && token === VERIFY_TOKEN) {
        return res.status(200).send(challenge);
      } else {
        return res.status(403).send('Verification failed');
      }
    }

    // 2) Handle incoming events (POST)
    if (req.method !== 'POST') {
      return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
    }

    const body = req.body || {};
    // Example structure:
    // body.entry[0].changes[0].value.messages[0]
    const entries = body.entry || [];
    for (const entry of entries) {
      const changes = entry.changes || [];
      for (const ch of changes) {
        const v = ch.value || {};
        const msgs = v.messages || [];
        for (const m of msgs) {
          let type = 'UNKNOWN';
          let message = '';
          let presetKey = undefined;

          if (m.type === 'interactive' && m.interactive?.type === 'button_reply') {
            const payload = m.interactive.button_reply?.id || ''; // e.g., "CHEER::GOT_THIS"
            if (payload.startsWith('CHEER::')) {
              type = 'CHEER';
              presetKey = payload.split('::')[1] || 'GOT_THIS';
              message = presetToText(presetKey);
            } else if (payload === 'NUDGE') {
              type = 'NUDGE';
              message = 'Nudge';
            } else if (payload === 'CHECKED') {
              type = 'CHECKED';
              message = 'Checked-in';
            }
          } else if (m.type === 'text') {
            // Free text reply (custom cheer)
            type = 'CHEER';
            message = String(m.text?.body || '').slice(0, 120).trim();
          }

          // Minimal ingestion (for demo we just re-route to our ingest API)
          if (type !== 'UNKNOWN' && message) {
            try {
              await fetch(process.env.SELF_BASE_URL
                ? `${process.env.SELF_BASE_URL}/api/supportEvents/add`
                : `http://localhost:3000/api/supportEvents/add`,
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    supporterName: displayNameFromMsg(m) || 'Supporter',
                    type,
                    message,
                    presetKey
                  })
                });
            } catch (e) {
              console.warn('Forward to /supportEvents/add failed (demo):', e);
            }
          }
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error('WA webhook error:', err);
    return res.status(200).json({ ok: true }); // avoid retries during demo
  }
}

function presetToText(key) {
  switch ((key || '').toUpperCase()) {
    case 'GOT_THIS': return "You've got this.";
    case 'EVERY_COUNTS': return 'Every dose counts.';
    case 'DESERVE_HEALTH': return 'You deserve to be healthy. Go on.';
    default: return "You've got this.";
  }
}

function displayNameFromMsg(m) {
  // Try to derive supporter display (depends on provider payload)
  // You might read m.from or profile fields when available.
  return m?.profile?.name || null;
}

export const config = {
  api: { bodyParser: { sizeLimit: '1mb' } }
};
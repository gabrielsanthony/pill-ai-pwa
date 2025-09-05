// --- helpers: preset mapping + simple profanity guard ---
function presetToText(key) {
    const k = String(key || '').toUpperCase();
    if (k === 'GOT_THIS') return "You've got this.";
    if (k === 'EVERY_COUNTS') return 'Every dose counts.';
    if (k === 'DESERVE_HEALTH') return 'You deserve to be healthy. Go on.';
    return "You've got this.";
}

// a tiny, kid-friendly filter for demo; swap for a real list later
const BAD_WORDS = ['damn', 'hell']; // add more if needed
function hasProfanity(s = '') {
    const lc = s.toLowerCase();
    return BAD_WORDS.some(w => lc.includes(w));
}

export default async function handler(req, res) {
    try {
        if (req.method !== 'POST') {
            return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
        }

        const { supporterName, type, message, presetKey } = req.body || {};
        const cleanType = (type || '').toUpperCase();
        if (!['CHEER', 'NUDGE', 'CHECKED'].includes(cleanType)) {
            return res.status(400).json({ ok: false, error: 'Invalid type' });
        }

        // normalize whitespace, cap at 120
        let finalMsg = String(message ?? '').replace(/\s+/g, ' ').trim();
        if (finalMsg.length > 120) finalMsg = finalMsg.slice(0, 120);

        // if CHEER and no free-text provided, fall back to presetKey mapping
        if (cleanType === 'CHEER' && !finalMsg && presetKey) {
            finalMsg = presetToText(presetKey);
        }

        // reject empty messages (e.g., CHEER without presetKey and no text)
        if (!finalMsg) {
            return res.status(400).json({ ok: false, error: 'Message is required.' });
        }

        // simple profanity guard for demo
        if (hasProfanity(finalMsg)) {
            return res.status(400).json({ ok: false, error: 'That message can’t be sent. Please keep it supportive.' });
        }

        const event = {
            id: crypto.randomUUID(),
            supporterName: supporterName || 'Supporter',
            type: cleanType,
            message: finalMsg,
            presetKey: presetKey || null,
            ts: Date.now()
        };

        // (MVP) Return event for the client to display.
        return res.status(200).json({ ok: true, event });
    } catch (err) {
        console.error('supportEvents/add error:', err);
        return res.status(500).json({ ok: false, error: 'Server error' });
    }
}
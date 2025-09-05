// /api/supporters/add.js
// MVP: validate inputs, pretend to send a WA invite, return a supporter object.

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') {
      res.status(405).json({ ok: false, error: 'Method Not Allowed' });
      return;
    }

    const { name, wa_phone } = req.body || {};
    const trimmedName = String(name || '').trim();
    const cleanedPhone = String(wa_phone || '').replace(/\s|-/g, '');

    // Basic validation (keep consistent with client)
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      res.status(400).json({ ok: false, error: 'Invalid name' });
      return;
    }
    if (!/^\+\d{6,15}$/.test(cleanedPhone)) {
      res.status(400).json({ ok: false, error: 'Invalid E.164 phone' });
      return;
    }

    // 🔌 Stub: here is where you’d call WhatsApp Cloud API with a template invite
    // await sendWhatsAppInvite({ to: cleanedPhone, name: trimmedName });  // (future)

    const supporter = {
      id: crypto.randomUUID(),
      name: trimmedName,
      wa_phone: cleanedPhone,
      status: 'Pending',       // will flip to 'Active' after WA consent in a later step
      createdAt: Date.now()
    };

    res.status(200).json({ ok: true, supporter });
  } catch (err) {
    console.error('API /supporters/add error:', err);
    res.status(500).json({ ok: false, error: 'Server error' });
  }
}
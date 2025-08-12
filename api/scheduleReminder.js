import { getFirestore, Timestamp } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';

const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY_JSON;
if (!serviceAccountJson) {
  throw new Error('FIREBASE_PRIVATE_KEY_JSON environment variable is not set');
}

const serviceAccount = JSON.parse(serviceAccountJson);
if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('📥 Received POST request to /api/scheduleReminder');

    try {
      const { token, title, body, sendAt, tag, kind } = req.body;
      console.log('📆 Raw sendAt string from frontend:', sendAt);
      console.log('🕒 Converted Date:', new Date(sendAt).toISOString());
      console.log('🔖 Tag from frontend:', tag || '(none)');
      console.log('🏷️ Kind from frontend:', kind || '(none)');

      // Required fields
      if (!token || !title || !body || !sendAt || !tag) {
        return res.status(400).json({
          success: false,
          message: 'Missing one or more required fields: token, title, body, sendAt, tag',
        });
      }

      // Validate sendAt
      const sendAtDate = new Date(sendAt);
      if (isNaN(sendAtDate.getTime())) {
        return res.status(400).json({ success: false, message: 'sendAt is not a valid ISO date' });
      }
      const now = Date.now();
      if (sendAtDate.getTime() < now - 30_000) {
        return res.status(400).json({ success: false, message: 'sendAt is in the past' });
      }

// ✅ Use `tag` as the document ID (idempotent key)
const docRef = db.collection('scheduledReminders').doc(tag);

await db.runTransaction(async (tx) => {
  const snap = await tx.get(docRef);

  // If this reminder was already sent, don't let a client overwrite it
  if (snap.exists && snap.data().sent === true) {
    throw new Error('This reminder has already been sent; refusing to overwrite.');
  }

  // Build the payload; preserve original createdAt/sent if the doc exists
  const base = snap.exists ? snap.data() : {};
  const createdAt = snap.exists ? (base.createdAt || new Date()) : new Date();

  tx.set(
    docRef,
    {
      token,
      title,
      body,
      tag,                         // stable unique key
      kind: kind || null,          // 't0' | 'od1' | 'n2'
      sendAt: Timestamp.fromDate(sendAtDate),
      sendAtISO: sendAtDate.toISOString(),
      createdAt,
      updatedAt: new Date(),
      sent: snap.exists ? (base.sent || false) : false,
      sending: snap.exists ? (base.sending || false) : false, // default so your cron filter works
    },
    { merge: true }
  );
});

return res.status(200).json({ success: true, id: tag });


    } catch (error) {
      console.error('🔥 Reminder save error:', error);
      return res.status(500).json({
        success: false,
        message: 'Error saving reminder',
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
    }
  } else {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
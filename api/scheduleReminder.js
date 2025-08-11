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

      // 🚫 De-dupe on tag (unsent)
      const existing = await db.collection('scheduledReminders')
        .where('tag', '==', tag)
        .where('sent', '==', false)
        .limit(1)
        .get();

      if (!existing.empty) {
        return res.status(200).json({
          success: true,
          deduped: true,
          message: 'Reminder already scheduled for this tag'
        });
      }

      // 📝 Save valid data to Firestore
      const docRef = await db.collection('scheduledReminders').add({
        token,
        title,
        body,
        tag,                        // unique per message
        kind: kind || null,         // 't0' | 'od1' | 'n2'
        sendAt: Timestamp.fromDate(sendAtDate),
        sendAtISO: sendAtDate.toISOString(), // optional but helpful
        createdAt: new Date(),
        sent: false,
      });

      return res.status(200).json({ success: true, id: docRef.id });
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
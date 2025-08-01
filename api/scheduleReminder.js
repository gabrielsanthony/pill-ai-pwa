import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, applicationDefault } from 'firebase-admin/app';

const app = initializeApp({
  credential: applicationDefault(), // or your service account
});

const db = getFirestore(app);

export default async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      const { token, title, body, sendAt } = req.body;

      // 🔍 Validate input
      if (!token || !title || !body || !sendAt) {
        return res.status(400).json({
          success: false,
          message: 'Missing one or more required fields: token, title, body, sendAt',
        });
      }

      // 📝 Save valid data to Firestore
      const docRef = await db.collection('scheduledReminders').add({
        token,
        title,
        body,
        sendAt,
        createdAt: new Date(),
      });

      res.status(200).json({ success: true, id: docRef.id });
    } catch (error) {
      console.error('🔥 Reminder save error:', error);
      res.status(500).json({
        success: false,
        message: 'Error saving reminder',
        error: error.message,
        stack: error.stack,
        code: error.code,
      });
    }
  } else {
    res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }
}
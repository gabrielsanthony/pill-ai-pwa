import { getFirestore } from 'firebase-admin/firestore';
import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging'; // ✅ add this line

const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY_JSON;

if (!serviceAccountJson) {
  throw new Error('FIREBASE_PRIVATE_KEY_JSON environment variable is not set');
}

const serviceAccount = JSON.parse(serviceAccountJson);

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method === 'POST') {
    console.log('📥 Received POST request to /api/scheduleReminder'); // 👈 ADD THIS

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

      // ✅ Send immediate push notification (for testing)
      const message = {
        token,
        notification: {
          title,
          body,
        },
      };

      try {
        console.log('📦 Sending push notification with title:', title); // 👈 ADD THIS
        const response = await getMessaging().send(message);
        console.log('✅ Push sent:', response);
      } catch (pushError) {
        console.error('❌ Push send error:', pushError);
      }

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
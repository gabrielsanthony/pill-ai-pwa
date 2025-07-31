// /api/scheduleReminder.js
import admin from 'firebase-admin';

// Parse service account
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

// Initialize Firebase Admin only once
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

// Import Firestore
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, token, sendAt } = req.body;

  if (!token || !title || !body || !sendAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const docRef = await db.collection('scheduledReminders').add({
      token,
      title,
      body,
      sendAt: new Date(sendAt),
      sent: false,
      createdAt: new Date(),
    });

    return res.status(200).json({
      success: true,
      id: docRef.id,
      scheduledAt: sendAt,
    });
  } catch (err) {
    console.error('❌ Firestore error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
}
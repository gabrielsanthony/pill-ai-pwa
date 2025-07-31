// /api/scheduleReminder.js
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { title, body, token, sendAt } = req.body;

  if (!token || !title || !body || !sendAt) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const sendTime = new Date(sendAt).getTime();
  const now = Date.now();
  const delay = sendTime - now;

  console.log('⏳ Scheduling push in', delay, 'ms');

  if (delay < 0) {
    return res.status(400).json({ error: 'Scheduled time is in the past' });
  }

  // Use setTimeout to delay the sending
  setTimeout(async () => {
    try {
      const message = {
        token,
        notification: { title, body },
      };

      const response = await admin.messaging().send(message);
      console.log('✅ Delayed notification sent:', response);
    } catch (err) {
      console.error('❌ Error sending delayed push:', err);
    }
  }, delay);

  // Respond immediately so frontend doesn't hang
  return res.status(200).json({
    success: true,
    scheduledIn: delay,
    sendAt,
  });
}
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

  const { title, body, token } = req.body;

  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    console.log('📤 Sending notification to token:', token);
    console.log('📨 Message payload:', message);

    const response = await admin.messaging().send(message);
    return res.status(200).json({ success: true, response });
} catch (err) {
  console.error('❌ Error sending push notification:', err);

return res.status(500).json({
  success: false,
  error: err.message || 'Unknown error'
});
}
}
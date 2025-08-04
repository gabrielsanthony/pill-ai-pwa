import { initializeApp, applicationDefault, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON || '{}');

if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'Missing push token' });
  }

  try {
    console.log('🗑️ Cancelling ALL reminders for token:', token);

    const snapshot = await db.collection('reminders')
      .where('token', '==', token)
      .get();

    if (snapshot.empty) {
      return res.status(404).json({ message: 'No reminders found for this token' });
    }

    const batch = db.batch();
    snapshot.forEach(doc => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return res.status(200).json({ success: true, message: 'All reminders deleted' });
  } catch (err) {
    console.error('❌ Error cancelling reminders:', err);
    return res.status(500).json({ error: 'Server error cancelling reminders' });
  }
}
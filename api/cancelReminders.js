import { getFirestore } from 'firebase-admin/firestore';
import { getApps, initializeApp, cert } from 'firebase-admin/app';

const serviceAccountJson = process.env.FIREBASE_PRIVATE_KEY_JSON;
const serviceAccount = JSON.parse(serviceAccountJson);

if (!getApps().length) {
  initializeApp({ credential: cert(serviceAccount) });
}

const db = getFirestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method not allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ success: false, message: 'Missing token' });
    }

    const snapshot = await db
      .collection('scheduledReminders')
      .where('token', '==', token)
      .where('sent', '==', false)
      .get();

    if (snapshot.empty) {
      return res.status(200).json({ success: true, deleted: 0 });
    }

    const batch = db.batch();
    snapshot.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    res.status(200).json({ success: true, deleted: snapshot.size });
  } catch (err) {
    console.error('🔥 Error cancelling reminders:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
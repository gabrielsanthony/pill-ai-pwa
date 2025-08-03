import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp();
}
const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ message: 'Missing token' });
  }

  try {
    const snapshot = await db
      .collection('scheduledReminders')
      .where('token', '==', token)
      .get();

    const batch = db.batch();

    snapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();

    return res.status(200).json({ message: 'Reminders cancelled' });
  } catch (err) {
    console.error('Error cancelling reminders:', err);
    return res.status(500).json({ message: 'Server error' });
  }
}
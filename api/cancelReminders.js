// /api/cancelReminders.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Missing push token' });
    }

    console.log('🗑️ Cancelling all reminders for token:', token);

    // 👉 Optionally clear saved reminders from a database or schedule manager
    // Since we don’t use Firestore or DB for saved reminders yet, we just return success
    return res.status(200).json({ message: 'Reminders cancelled (simulated)' });
  } catch (err) {
    console.error('❌ Error in cancelReminders:', err);
    return res.status(500).json({ error: 'Server error cancelling reminders' });
  }
}
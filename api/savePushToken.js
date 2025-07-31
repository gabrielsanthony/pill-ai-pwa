// api/savePushToken.js

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Only POST requests allowed' });
  }

  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'No token provided' });
    }

    console.log('📥 Saving token:', token);

    // TODO: Store the token in a real database or Firestore.
    // For now, just return success.
    return res.status(200).json({ message: 'Token received successfully' });
  } catch (error) {
    console.error('❌ Error saving token:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
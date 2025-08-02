const functions = require('firebase-functions');
const admin = require('firebase-admin');
const fetch = require('node-fetch');

admin.initializeApp();
const db = admin.firestore();

// 🕒 Run every minute to check for due reminders
exports.sendScheduledReminders = functions.pubsub
  .schedule('* * * * *') // every minute
  .onRun(async () => {
    const now = admin.firestore.Timestamp.now();

    const dueReminders = await db.collection('scheduledReminders')
      .where('sendAt', '<=', now)
      .get();

    const sendPromises = [];

    dueReminders.forEach(doc => {
      const data = doc.data();
      const { token, title, body } = data;

      console.log(`📣 Sending notification to ${token}: ${title}`);

      const message = {
        notification: {
          title,
          body,
        },
        token,
      };

      // Firebase Cloud Messaging REST API endpoint
      const sendPromise = fetch('https://fcm.googleapis.com/fcm/send', {
        method: 'POST',
        headers: {
          'Authorization': `key=${process.env.FIREBASE_SERVER_KEY}`, // Set this key in Vercel
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          notification: message.notification,
          to: token,
        }),
      }).then(res => {
        if (!res.ok) throw new Error(`Failed to send: ${res.statusText}`);
        return res.json();
      });

      sendPromises.push(sendPromise);

      // Optionally delete after sending
      db.collection('scheduledReminders').doc(doc.id).delete();
    });

    await Promise.all(sendPromises);
    console.log(`✅ Sent ${sendPromises.length} notifications`);

    return null;
  });
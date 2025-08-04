// functions-v2/sendReminders.js
import admin from "firebase-admin";
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getMessaging } from "firebase-admin/messaging";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();
const messaging = getMessaging();

export const sendReminders = onSchedule("every 1 minutes", async () => {
  const now = new Date();
  const nowTimestamp = admin.firestore.Timestamp.fromDate(now);

  const snapshot = await db.collection("scheduledReminders")
    .where("sendAt", "<=", nowTimestamp)
    .where("sent", "==", false)
    .get();

  if (snapshot.empty) return;

  for (const doc of snapshot.docs) {
    const data = doc.data();

    try {
      console.log(`📤 Sending reminder to ${data.token} for "${data.title}"`);

      await messaging.send({
        token: data.token,
        notification: {
          title: data.title || "💊 Time to take your medicine!",
          body: data.body || "Please take your scheduled dose.",
        },
      });

      await doc.ref.update({ sent: true }); // ✅ Prevent re-sending
    } catch (err) {
      console.error("❌ Error sending reminder:", err);
    }
  }
});
import { onSchedule } from "firebase-functions/v2/scheduler";
import { getFirestore } from "firebase-admin/firestore";
import { initializeApp } from "firebase-admin/app";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

export const sendScheduledRemindersV2 = onSchedule("every 1 minutes", async (event) => {
  const now = new Date();

  console.log("🕒 Running scheduled check at", now.toISOString());

  const snapshot = await db.collection("scheduledReminders")
    .where("sendAt", "<=", now)
    .where("sent", "!=", true)
    .get();

  if (snapshot.empty) {
    console.log("✅ No reminders to send at this time.");
    return;
  }

  const sendPromises = [];

  snapshot.forEach((doc) => {
    const data = doc.data();
    const { token, title, body } = data;

    const message = {
      token,
      notification: { title, body },
    };

    console.log(`📤 Sending notification to token: ${token}`);

    const sendPromise = messaging.send(message)
      .then(() => {
        console.log(`✅ Notification sent for doc: ${doc.id}`);
        return doc.ref.update({ sent: true });
      })
      .catch((error) => {
        console.error(`❌ Error sending notification for doc ${doc.id}:`, error);
      });

    sendPromises.push(sendPromise);
  });

  await Promise.all(sendPromises);
});
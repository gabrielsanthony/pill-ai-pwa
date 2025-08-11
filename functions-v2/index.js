import { onSchedule } from "firebase-functions/v2/scheduler";
import { initializeApp } from "firebase-admin/app";
import { getFirestore, Timestamp, FieldValue } from "firebase-admin/firestore";
import { getMessaging } from "firebase-admin/messaging";

initializeApp();
const db = getFirestore();
const messaging = getMessaging();

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

export const sendScheduledRemindersV2 = onSchedule("every 1 minutes", async () => {
  const now = Timestamp.now();
  const cushionMs = 30 * 1000; // 30s grace
  const cutoff = Timestamp.fromMillis(now.toMillis() + cushionMs);

  console.log("🕒 Checking due reminders up to", cutoff.toDate().toISOString());

  const snap = await db
    .collection("scheduledReminders")
    .where("sent", "==", false)
    .where("sendAt", "<=", cutoff)
    .limit(200) // safety cap per tick
    .get();

  if (snap.empty) {
    console.log("✅ No reminders due.");
    return;
  }

  const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
  console.log(`📦 Found ${docs.length} due reminders.`);

  // Send in small batches
  const batches = chunk(docs, 25);
  let sentCount = 0, failCount = 0;

  for (const batch of batches) {
    const tasks = batch.map(async (doc) => {
      const { token, title, body, tag, kind } = doc;

      // ✅ DATA-ONLY WEBPUSH — no notification block here!
      const message = {
        token,
        webpush: {
          headers: { Urgency: "high" },
          fcmOptions: {
            link: process.env.BASE_URL || "https://pill-ai-pwa.vercel.app"
          }
        },
        data: {
          title: String(title || "Pill-AI Reminder"),
          body: String(body || "It's time for your medication."),
          tag: String(tag || `pillai:${Date.now()}`),
          kind: String(kind || ""),     // t0 | od1 | n2
          encouragement: ""             // optional; SW can add its own
        }
      };

      try {
        const resp = await messaging.send(message);

        await db.collection("scheduledReminders").doc(doc.id).update({
          sent: true,
          sentAt: Timestamp.now(),
          sendResponseId: resp,
          tries: FieldValue.increment(1)
        });

        sentCount++;
        console.log(`✅ Sent tag=${message.data.tag} doc=${doc.id} resp=${resp}`);
      } catch (err) {
        failCount++;
        console.error(`❌ Send failed tag=${message.data.tag} doc=${doc.id}`, err);

        // Leave sent=false; add backoff metadata for future improvements
        await db.collection("scheduledReminders").doc(doc.id).update({
          lastError: err?.message || String(err),
          lastTriedAt: Timestamp.now(),
          tries: FieldValue.increment(1)
        });
      }
    });

    await Promise.all(tasks);
  }

  console.log(`🏁 Done. Sent=${sentCount}, Failed=${failCount}`);
});
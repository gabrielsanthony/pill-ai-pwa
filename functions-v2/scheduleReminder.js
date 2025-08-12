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
                        .where("sending", "==", false)
                            .get();

                              if (snapshot.empty) return;
for (const doc of snapshot.docs) {
  const ref = doc.ref;

  // 1) TAKE A LOCK inside a transaction (idempotent guard)
  let locked = false;
  let data;

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    if (!snap.exists) return;

    data = snap.data();

    // If already sent, or someone else is sending, SKIP
    if (data.sent === true || data.sending === true) return;

    // Otherwise, take the lock
    tx.update(ref, {
      sending: true,
      sendingAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    locked = true;
  });

  // No lock acquired? Someone else is handling it — skip.
  if (!locked) {
    // Optional: log once so you can see it working
    // console.log(`⏭️ Skipping doc ${ref.id} (already sent or in-flight)`);
    continue;
  }

  try {
    // 2) SEND the push (now we own the lock)
    const title = data.title || "💊 Time to take your medicine!";
    const body  = data.body  || "Please take your scheduled dose.";

    console.log(`📤 Sending reminder to ${data.token} | tag/doc: ${ref.id} | "${title}"`);

    await messaging.send({
      token: data.token,
      notification: { title, body },
      // You can add .data here too if you want to carry tag/kind
      // data: { tag: data.tag || ref.id, kind: data.kind || "" },
    });

    // 3) Mark as sent and release the lock
    await ref.update({
      sent: true,
      sentAt: admin.firestore.FieldValue.serverTimestamp(),
      sending: false,
    });
  } catch (err) {
    console.error(`❌ Error sending reminder for doc ${ref.id}:`, err);

    // Release the lock so it can retry on the next tick
    await ref.update({
      sending: false,
      lastError: String(err?.message || err),
      lastErrorAt: admin.firestore.FieldValue.serverTimestamp(),
    });
  }
}
    
        });
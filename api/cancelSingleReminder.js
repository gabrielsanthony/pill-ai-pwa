// api/cancelSingleReminder.js
import admin from "firebase-admin";

if (!admin.apps.length) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_PRIVATE_KEY_JSON);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).end("Method Not Allowed");

  const { token, timestamp } = req.body;
  if (!token || !timestamp) return res.status(400).json({ error: "Missing fields" });

  try {
    const snap = await db.collection("scheduledReminders")
      .where("token", "==", token)
      .where("sendAt", "==", timestamp)
      .get();

    const batch = db.batch();
    snap.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error("Cancel error", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
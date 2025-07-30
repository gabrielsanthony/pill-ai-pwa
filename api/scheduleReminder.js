// api/scheduleReminder.js
import { NextResponse } from 'next/server';
import admin from 'firebase-admin';

const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON); // already in Vercel secrets

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export async function POST(req) {
  const { title, body, token } = await req.json();

  try {
    const message = {
      token,
      notification: {
        title,
        body,
      },
    };

    const response = await admin.messaging().send(message);
    return NextResponse.json({ success: true, response });
  } catch (err) {
    console.error('❌ Error sending push notification:', err);
    return NextResponse.json({ success: false, error: err.message });
  }
}
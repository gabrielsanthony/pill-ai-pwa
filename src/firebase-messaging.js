// src/firebase-messaging.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyD4IIK7DRJLGE5bKNe5J0W2ufbyUWsA4oc",
  authDomain: "pill-ai-935d5.firebaseapp.com",
  projectId: "pill-ai-935d5",
  storageBucket: "pill-ai-935d5.appspot.com",
  messagingSenderId: "861184373325",
  appId: "1:861184373325:web:c0589d6a64e1c1fa046204"
};

// ✅ Use ONE public VAPID key (copy the value from Firebase Console → Web Push certificates)
const VAPID_PUBLIC_KEY = 'BB12zXeJSqQ73BnhGfMBQWsc5ww-1p_Ftaf8zcYeoKWXrbD9e2h2nzibSlOuqWNkJDeK3nrCHlkYJOQ5CufuVys';

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Request permission + return the device token
export const requestNotificationPermission = async () => {
  try {
    if (Notification.permission !== 'granted') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('❌ Notification permission denied');
        return null;
      }
    }

    // ❗️No second SW registration here — sw.js already imports your messaging SW
    const token = await getToken(messaging, { vapidKey: VAPID_PUBLIC_KEY });
    console.log('[FCM] Web device token:', token);
    return token;
  } catch (err) {
    console.error('❌ Error while retrieving token:', err);
    return null;
  }
};

// Foreground messages (optional toast)
onMessage(messaging, (payload) => {
  console.log('📩 Foreground message received:', payload);

  const title = payload?.notification?.title || payload?.data?.title || 'Pill-AI Reminder';
  const body  = payload?.notification?.body  || payload?.data?.body  || "It's time for your medication.";

  // Show a simple foreground notification (safe fallback)
  if (Notification.permission === 'granted') {
    try {
      const n = new Notification(title, { body, requireInteraction: false });
      n.onclick = () => window.focus();
    } catch (e) {
      console.warn('Notification display failed:', e);
    }
  }
});
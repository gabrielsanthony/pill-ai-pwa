// src/firebase-notifications.js
import { getToken } from 'firebase/messaging';
import { messaging } from './firebase-config'; // ✅ use the instance you already export

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// 🔎 ADD THESE TWO LINES (right after VAPID_KEY):
console.log('[FCM][DEBUG] VAPID exists?', Boolean(VAPID_KEY));
console.log('[FCM][DEBUG] VAPID preview:', VAPID_KEY ? (VAPID_KEY.slice(0, 6) + '…  len=' + VAPID_KEY.length) : 'MISSING');

// …rest of your file unchanged…

export const requestPermissionAndGetToken = async () => {
  try {
    console.log('[FCM] Requesting notification permission…');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Permission not granted');
      return null;
    }

    // Ensure the FCM SW is registered and pass it to getToken (critical on desktop)
    let registration =
      (await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')) ||
      (await navigator.serviceWorker.register('/firebase-messaging-sw.js'));

// Wait for it to be fully active (belt & suspenders)
    await navigator.serviceWorker.ready;
    console.log('[FCM] Service Worker registered @ scope:', registration.scope);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn('[FCM] No push token available (getToken returned null/empty).');
      return null;
    }

    console.log('[FCM] Token acquired:', token.slice(0, 12) + '…');
    return token;
  } catch (err) {
    console.error('[FCM] Error while retrieving token:', err);
    console.error('[FCM] err.name:', err?.name, 'err.code:', err?.code, 'err.message:', err?.message);
// Helpful hints based on common desktop errors:
    if (String(err?.message || '').includes('public key')) {
      console.error('[Hint] This usually means the VAPID key is missing/mismatched. Check Firebase Console → Project settings → Cloud Messaging → Web configuration.');
    }
    if (err?.code === 'messaging/permission-blocked') {
      console.error('[Hint] Site notifications are blocked in the browser. Allow notifications for this site.');
    }
    return null;
  }
};
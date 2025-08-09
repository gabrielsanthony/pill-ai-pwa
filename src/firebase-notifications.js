// src/firebase-notifications.js
import { getToken /*, onMessage*/ } from 'firebase/messaging';
import { messaging } from './firebase-config'; // ✅ use the instance you already export

const VAPID_KEY =
  'BB12zXeJSqQ73BnhGfMBQWsc5ww-1p_Ftaf8zcYeoKWXrbD9e2h2nzibSlOuqWNkJDeK3nrCHlkYJOQ5CufuVys';

export const requestPermissionAndGetToken = async () => {
  try {
    console.log('[FCM] Requesting notification permission…');
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('[FCM] Permission not granted');
      return null;
    }

    // Ensure the FCM SW is registered and pass it to getToken (critical on desktop)
    const registration =
      (await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')) ||
      (await navigator.serviceWorker.register('/firebase-messaging-sw.js'));

    console.log('[FCM] Service Worker registered:', registration);

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (!token) {
      console.warn('[FCM] No push token available');
      return null;
    }

    console.log('[FCM] Token acquired:', token.slice(0, 12) + '…');
    return token;
  } catch (err) {
    console.error('[FCM] Error while retrieving token:', err);
    return null;
  }
};
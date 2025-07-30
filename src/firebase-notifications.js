// src/firebase-notifications.js
import { messaging, getToken, onMessage } from './firebase-config';

// 🔑 Paste your public VAPID key from Firebase Console here:
const VAPID_KEY = 'BB12zXeJSqQ73BnhGfMBQWsc5ww-1p_Ftaf8zcYeoKWXrbD9e2h2nzibSlOuqWNkJDeK3nrCHlkYJOQ5CufuVys';

export const requestPermissionAndGetToken = async () => {
  console.log('Requesting notification permission...');
  const permission = await Notification.requestPermission();

  if (permission === 'granted') {
    console.log('Notification permission granted.');

    try {
      const currentToken = await getToken(messaging, {
        vapidKey: VAPID_KEY,
      });

      if (currentToken) {
        console.log('✅ Push token:', currentToken);
        return currentToken;
      } else {
        console.warn('❌ No registration token available.');
      }
    } catch (err) {
      console.error('An error occurred while retrieving token:', err);
    }
  } else {
    console.warn('❌ Notification permission not granted.');
  }

  return null;
};

// Optional: handle foreground messages
onMessage(messaging, (payload) => {
  console.log('📩 Foreground message received:', payload);
});

import { getMessaging } from 'firebase/messaging';
export const messaging = getMessaging();
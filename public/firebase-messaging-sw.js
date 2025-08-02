/* public/firebase-messaging-sw.js */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyD4IIK7DRJLGE5bKNe5J0W2ufbyUWsA4oc",
  authDomain: "pill-ai-935d5.firebaseapp.com",
  projectId: "pill-ai-935d5",
  storageBucket: "pill-ai-935d5.appspot.com",
  messagingSenderId: "861184373325",
  appId: "1:861184373325:web:c0589d6a64e1c1fa046204"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Pill-AI Reminder';
  const notificationOptions = {
    body: payload.notification?.body || 'You have a medication to take!',
    icon: '/icon-192x192.png'
  };

self.registration.showNotification(notificationTitle, notificationOptions);
});

// ✅ Ensures push always shows notification
self.addEventListener('push', function (event) {
  const payload = event.data?.json();
  console.log('[firebase-messaging-sw.js] Push event received:', payload);

  const title = payload?.notification?.title || '💊 Pill Reminder';
  const body = payload?.notification?.body || 'Time to take your medicine';

  const options = {
    body: body,
    icon: '/icon-192x192.png',
    requireInteraction: true,
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});
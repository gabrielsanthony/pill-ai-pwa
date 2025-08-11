/* public/firebase-messaging-sw.js */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

// Bump this when you change SW so browsers update it
const PILL_AI_SW_VERSION = '2.0.0';

firebase.initializeApp({
  apiKey: "AIzaSyD4IIK7DRJLGE5bKNe5J0W2ufbyUWsA4oc",
  authDomain: "pill-ai-935d5.firebaseapp.com",
  projectId: "pill-ai-935d5",
  storageBucket: "pill-ai-935d5.appspot.com",
  messagingSenderId: "861184373325",
  appId: "1:861184373325:web:c0589d6a64e1c1fa046204"
});

const messaging = firebase.messaging();

/* --- Short, encouraging one-liners --- */
const POSITIVE_LINES = [
  "You’ve got this! 🙌",
  "Small steps add up. ✨",
  "Consistency matters. 💪",
  "Your health is worth it. 💚",
  "Nice work staying on track! ✅",
  "Tiny pill, big progress. 🌱",
  "Strong tomorrow starts now. 🔆",
  "One minute for your future. ⏳",
  "Keep the streak going! 🔥",
  "You’re worth the effort. 🌟",
  "Small step, huge impact. 🚀",
   "Your health, your win. 🏆"
];
const pickLine = () => POSITIVE_LINES[Math.floor(Math.random() * POSITIVE_LINES.length)];

messaging.onBackgroundMessage(async function(payload) {
  console.log('[Pill‑AI SW] Background message received:', payload);

  // 1) Extract fields from either notification or data payloads
  const title = payload.notification?.title || payload.data?.title || 'Pill-AI Reminder';
  const baseBody = payload.notification?.body || payload.data?.body || 'You have a medication to take!';
  const encouragement = payload.data?.encouragement || pickLine();
  const body = `${baseBody} ${encouragement}`.trim();

  // Keep tags unique per dose so notifications don’t replace each other
  const tag = payload.data?.tag || `pillai:${Date.now()}`;
  const data = payload.data || {};

  try {
    // 2) Tell all open pages (visible or hidden) so visible tabs can show the toast
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    clientsList.forEach(c => {
      try {
        c.postMessage({ type: 'REMINDER', payload: { title, body, tag, data } });
      } catch (e) {}
    });

    // 3) Only show OS banner if NO tab is visible
    const anyVisible = clientsList.some(c => c.visibilityState === 'visible');

    if (!anyVisible) {
      await self.registration.showNotification(title, {
        body,
        icon: '/icon-192x192.png',
        tag,
        data,
        requireInteraction: false
      });
      console.log('[Pill‑AI SW] No visible tab → showed OS banner.');
    } else {
      console.log('[Pill‑AI SW] A tab is visible → suppress OS banner; page will show toast.');
    }
  } catch (err) {
    console.warn('[Pill‑AI SW] Error handling background message:', err);
    // Fallback: at least show a banner
    await self.registration.showNotification(title, {
      body,
      icon: '/icon-192x192.png',
      tag,
      data
    });
  }
});

// Focus the app when the user clicks the banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const allClients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (allClients.length) {
      return allClients[0].focus();
    }
    return self.clients.openWindow(self.location.origin);
  })());
});
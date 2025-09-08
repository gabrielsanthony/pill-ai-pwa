// public/firebase-messaging-sw.js
// Minimal SW that handles data-only WebPush (no firebase.messaging needed)

// Bump to force browsers to update the SW when deployed
const PILL_AI_SW_VERSION = '3.0.0';

// Let pages tell this SW to activate immediately after update
self.addEventListener('message', (event) => {
  if (event?.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Make this SW PWA-installable without changing FCM behavior
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => event.waitUntil(self.clients.claim()));
// Older Chrome used to require a fetch handler; harmless no-op:
self.addEventListener('fetch', () => {});

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
  "Your health, your win. 🏆",
];
const pickLine = () => POSITIVE_LINES[Math.floor(Math.random() * POSITIVE_LINES.length)];

// Handle ALL pushes (works for data-only messages sent by Admin SDK)
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let payload = {};
    try {
      payload = event.data ? event.data.json() : {};
    } catch (_) {}

    // Our function puts everything under message.data
    const data = payload.data || payload; // support both shapes just in case

    const title = data.title || 'Pill‑AI Reminder';
    const baseBody = data.body || "It's time for your medication.";
    const encouragement = data.encouragement || pickLine();
    const body = `${baseBody} ${encouragement}`.trim();

    const tag  = data.tag  || `pillai:${Date.now()}`;
    const kind = data.kind || ''; // t0 | od1 | n2

    // If any tab is visible, forward to page and don't show OS banner
    const clientsList = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const visibleClient = clientsList.find(c => c.visibilityState === 'visible');

    if (visibleClient) {
      visibleClient.postMessage({ type: 'REMINDER', payload: { title, body, tag, kind } });
      return; // toast will be shown by the page
    }

    // Otherwise, show system notification
    await self.registration.showNotification(title, {
      body,
      tag,
      data: { tag, kind },
      icon: '/icons/maskable-192.png',          // keep or remove if not present
      // badge: '/badge-72x72.png',
      requireInteraction: false
    });
  })());
});

// Focus/open the app when the user clicks a banner
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of all) {
      if ('focus' in c) {
        await c.focus();
        c.postMessage({ type: 'REMINDER_CLICK', tag: (event.notification.data||{}).tag });
        return;
      }
    }
    await self.clients.openWindow('/');
  })());
});
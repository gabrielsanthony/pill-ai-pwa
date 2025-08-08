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

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Background message received:', payload);
  
  const notificationTitle = payload.notification?.title || 'Pill-AI Reminder';
  const baseBody = payload.notification?.body || 'You have a medication to take!';
  const encouragement = payload.data?.encouragement || pickLine();

  const notificationOptions = {
    body: `${baseBody} ${encouragement}`,   // 👈 append the positive line
    icon: '/icon-192x192.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
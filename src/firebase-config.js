// src/firebase-config.js
import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { getFirestore } from 'firebase/firestore';
import { getAuth, signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { getApp, getApps, initializeApp } from 'firebase/app';

// ✅ Your existing config
const firebaseConfig = {
  apiKey: "AIzaSyD4IIK7DRJLGE5bKNe5J0W2ufbyUWsA4oc",
  authDomain: "pill-ai-935d5.firebaseapp.com",
  projectId: "pill-ai-935d5",
  storageBucket: "pill-ai-935d5.appspot.com",
  messagingSenderId: "861184373325",
  appId: "1:861184373325:web:c0589d6a64e1c1fa046204",
  measurementId: "G-XPXEY3KPPS"
};

// ✅ Initialize Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// 🔔 Messaging
const messaging = getMessaging(app);

// 🔥 Firestore
const db = getFirestore(app);

// 👤 Auth
const auth = getAuth(app);
onAuthStateChanged(auth, () => {}); // Prime auth readiness


// 🚀 Anonymous sign-in (auto)
signInAnonymously(auth).catch((error) => {
  console.error("Anonymous sign-in error:", error);
});

export {
  messaging, getToken, onMessage,  // notifications
  db, auth                         // firestore + auth
};
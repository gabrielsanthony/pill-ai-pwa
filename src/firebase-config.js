// src/firebase-config.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
 apiKey: "AIzaSyD4IIK7DRJLGE5bKNe5J0W2ufbyUWsA4oc",
  authDomain: "pill-ai-935d5.firebaseapp.com",
  projectId: "pill-ai-935d5",
  storageBucket: "pill-ai-935d5.appspot.com",
  messagingSenderId: "861184373325",
  appId: "1:861184373325:web:c0589d6a64e1c1fa046204",
  measurementId: "G-XPXEY3KPPS"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
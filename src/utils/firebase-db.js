// src/utils/firebase-db.js
import { getApps, getApp, initializeApp } from 'firebase/app';
import {
  getFirestore,
  doc, setDoc, addDoc, collection,
  serverTimestamp, getDocs, query, orderBy, where, limit
} from 'firebase/firestore';
import { getAuth, signInAnonymously } from 'firebase/auth';

// Reuse your existing config file name:
import firebaseConfig from '../firebase-config';

// --- init once (reuses existing app if already initialized elsewhere) ---
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const db  = getFirestore(app);
const auth = getAuth(app);

// Ensure we have an anonymous user (MVP—no login UI)
export async function ensureAnonAuth() {
  if (!auth.currentUser) await signInAnonymously(auth);
  return auth.currentUser; // { uid }
}

// Create a short join link for a supporter
export async function createJoinLink(ownerId, ownerName) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g. ABC123
  await setDoc(doc(db, 'joinCodes', code), {
    ownerId,
    ownerName: ownerName || 'Mia',
    createdAt: serverTimestamp()
  });
  const url = `${window.location.origin}/?join=${code}`;
  return { code, url };
}

// (We’ll finish this in a later step)
export async function completeJoin(code, supporterName) {
  return { code, supporterName };
}

// Write a support event (NUDGE, CHEER, NUDGE_REQUEST…)
export async function addSupportEvent(ownerId, payload) {
  const ref = doc(collection(db, 'owners', ownerId, 'supportEvents'));
  await setDoc(ref, { ...payload, ts: serverTimestamp() });
  return { id: ref.id, ...payload };
}

// Read recent events for Mia’s feed (optional sanity check)
export async function getRecentSupportEvents(ownerId) {
  const q = query(
    collection(db, 'owners', ownerId, 'supportEvents'),
    orderBy('ts', 'desc'),
    limit(50)
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

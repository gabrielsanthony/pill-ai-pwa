// Reuse already-initialized Firebase from your config file:
import { db, auth } from '../firebase-config';
import {
  doc, setDoc, addDoc, collection,
  serverTimestamp, getDocs, getDoc,   // ← moved getDoc up here
  query, orderBy, where, limit,
  onSnapshot                          // ← add this
} from 'firebase/firestore';

// Ensure we have an anonymous user (your firebase-config already signs in)
export async function ensureAnonAuth() {
  return auth.currentUser; // { uid } or null briefly at startup
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

export async function completeJoin(code, supporterName) {
  // 1) Look up the join code
  const codeRef = doc(collection(db, 'joinCodes'), code);
  const snap = await getDoc(codeRef);
  if (!snap.exists()) throw new Error('Invalid or expired code');

  const { ownerId, ownerName } = snap.data();

  // 2) Create supporter record under the owner
  const supRef = doc(collection(db, 'owners', ownerId, 'supporters'));
  await setDoc(supRef, {
    supporterUid: crypto.randomUUID(),              // MVP id (no login yet)
    name: supporterName || 'Supporter',
    status: 'Active',
    createdAt: serverTimestamp()
  });

  // 3) Return for UI
  return { ownerId, ownerName };
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

// Live listener for support events (owner = med-taker)
export function listenSupportEvents(ownerId, cb, { onlyTypes = null } = {}) {
  if (!ownerId) return () => {};
  const col = collection(db, 'owners', ownerId, 'supportEvents');
  const q = query(col, orderBy('ts', 'desc'));

  return onSnapshot(q, (snap) => {
    let rows = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    // Optional client-side filter (Firestore can't OR multiple equality easily here)
    if (onlyTypes && Array.isArray(onlyTypes) && onlyTypes.length) {
      rows = rows.filter(r => onlyTypes.includes(r.type));
    }
    cb(rows);
  }, (err) => {
    console.error('listenSupportEvents error:', err);
    cb([]); // be graceful
  });
}

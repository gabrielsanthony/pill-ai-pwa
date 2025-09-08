// src/utils/firebase-db.js
// Reuse already-initialized Firebase from your config file:
import { db, auth } from '../firebase-config';
import {
  doc, setDoc, addDoc, collection,
  serverTimestamp, getDocs, getDoc,
  query, orderBy, where, limit,
  onSnapshot
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';

/* =========================================================
   AUTH HELPERS
========================================================= */

// Ensure we have an authenticated user (your firebase-config should sign in anon on load)
export async function ensureAnonAuth() {
  return auth.currentUser; // { uid } or null briefly at startup
}

// Wait until auth is ready (resolves with a user or null if sign-in fails)
export function waitForAuthReady() {
  if (auth.currentUser) return Promise.resolve(auth.currentUser);
  return new Promise((resolve) => {
    const unsub = onAuthStateChanged(auth, (u) => {
      unsub();
      resolve(u || null);
    });
  });
}

// Build auth headers with Firebase ID token (for HTTPS Cloud Functions)
async function authHeaders() {
  const user = await waitForAuthReady();
  if (!user) throw new Error('NO_AUTH_USER');
  const token = await user.getIdToken();
  return { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
}

// Cloud Functions base URL (v2 HTTPS). Set this in your env (.env.local / Vercel).
const BASE = import.meta.env.VITE_FUNCTIONS_BASE_URL || '';
function assertBase() {
  if (!BASE) {
    console.warn('VITE_FUNCTIONS_BASE_URL is not set. Calls to Cloud Functions will fail.');
  }
}

/* =========================================================
   🔹 NEW: Single Cheer Squad + Invite Codes (mutual add/remove)
   Firestore shape:
     users/{uid}/cheerSquad/{otherUid} -> { joinedAt, displayName? }
   Cloud Functions (you added):
     GET  {BASE}/createInviteCode       -> { code, expiresAt }
     POST {BASE}/redeemInviteCode {code}-> { ok: true }
     POST {BASE}/removeCheerLink {uid}  -> { ok: true }
========================================================= */

// Real-time listener for my single Cheer Squad list
export function listenCheerSquad(cb) {
  let stop = () => {};
  // Subscribe only after auth is ready
  waitForAuthReady().then((user) => {
    if (!user) return;
    const colRef = collection(db, 'users', user.uid, 'cheerSquad');
    const qy = query(colRef, orderBy('joinedAt', 'desc'));
    stop = onSnapshot(qy, (snap) => {
      const rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      cb(rows);
    }, (err) => {
      console.error('listenCheerSquad error:', err);
      cb([]);
    });
  });
  return () => stop && stop();
}

// Create an invite code tied to the current user
export async function generateInviteCode() {
  assertBase();
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/createInviteCode`, { method: 'GET', headers });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data; // { code, expiresAt }
}

// Redeem an invite code (server performs mutual add)
export async function redeemInviteCode(code) {
  assertBase();
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/redeemInviteCode`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ code })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data; // { ok: true }
}

// Mutual remove (server deletes both directions)
export async function removeCheerMate(otherUid) {
  assertBase();
  const headers = await authHeaders();
  const res = await fetch(`${BASE}/removeCheerLink`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ otherUid })
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
  return data; // { ok: true }
}

/* =========================================================
   🔹 EXISTING: Support Events (feed / messaging)
   Stored under:
     owners/{ownerId}/supportEvents
   Kept as-is so reminders/overdues/“Meds Taken” are unaffected.
========================================================= */

// Write a support event (NUDGE, CHEER, CHECKED, etc.)
export async function addSupportEvent(ownerId, payload) {
  const ref = doc(collection(db, 'owners', ownerId, 'supportEvents'));
  await setDoc(ref, { ...payload, ts: serverTimestamp() });
  return { id: ref.id, ...payload };
}

// One-off read of recent events
export async function getRecentSupportEvents(ownerId) {
  const qy = query(
    collection(db, 'owners', ownerId, 'supportEvents'),
    orderBy('ts', 'desc'),
    limit(50)
  );
  const snap = await getDocs(qy);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
}

// Live listener for support events (owner = med-taker)
export function listenSupportEvents(ownerId, cb, { onlyTypes = null } = {}) {
  if (!ownerId || !cb) {
    console.warn('listenSupportEvents: missing ownerId or callback');
    return () => {};
  }
  const colRef = collection(db, 'owners', ownerId, 'supportEvents');
  const qy = query(colRef, orderBy('ts', 'desc'));
  return onSnapshot(
    qy,
    (snap) => {
      let rows = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      if (onlyTypes && Array.isArray(onlyTypes) && onlyTypes.length) {
        rows = rows.filter((r) => onlyTypes.includes(r.type));
      }
      cb(rows);
    },
    (err) => {
      console.error('listenSupportEvents error:', err);
      cb([]); // be graceful
    }
  );
}

/* =========================================================
   🔸 LEGACY (kept for compatibility): join link demo
   — Safe to keep; does not interact with reminders
========================================================= */

export async function createJoinLink(ownerId, ownerName) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase(); // e.g., ABC123
  await setDoc(doc(db, 'joinCodes', code), {
    ownerId,
    ownerName: ownerName || 'Mia',
    createdAt: serverTimestamp()
  });
  const url = `${window.location.origin}/?join=${code}`;
  return { code, url };
}

export async function completeJoin(code, supporterName) {
  const codeRef = doc(collection(db, 'joinCodes'), code);
  const snap = await getDoc(codeRef);
  if (!snap.exists()) throw new Error('Invalid or expired code');

  const { ownerId, ownerName } = snap.data();

  const supRef = doc(collection(db, 'owners', ownerId, 'supporters'));
  await setDoc(supRef, {
    supporterUid: crypto.randomUUID(), // MVP id (no login yet)
    name: supporterName || 'Supporter',
    status: 'Active',
    createdAt: serverTimestamp()
  });

  return { ownerId, ownerName };
}                                                                                                      
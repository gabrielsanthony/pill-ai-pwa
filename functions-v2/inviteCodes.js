// functions-v2/inviteCodes.js
import { getApps, initializeApp } from 'firebase-admin/app';
import { onRequest } from 'firebase-functions/v2/https';
import { setGlobalOptions } from 'firebase-functions/v2';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore, Timestamp } from 'firebase-admin/firestore';

setGlobalOptions({ region: 'us-central1' }); // <-- match your VITE_FUNCTIONS_BASE_URL host

if (!getApps().length) initializeApp();
const db = getFirestore();

// CORS wrapper
const withCors = (handler) => async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Authorization,Content-Type');
  res.set('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.status(204).end();
  return handler(req, res);
};

function randomCode(len = 6) {
  const alphabet = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let s = ''; for (let i = 0; i < len; i++) s += alphabet[Math.floor(Math.random()*alphabet.length)];
  return s;
}

export const createInviteCode = onRequest(withCors(async (req, res) => {
  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace('Bearer ', '');
  const decoded = await getAuth().verifyIdToken(idToken);
  const ownerUid = decoded.uid;

  // unique code
  let code, ref, exists = true, tries = 0;
  while (exists && tries < 6) {
    code = randomCode(6);
    ref = db.collection('inviteCodes').doc(code);
    exists = (await ref.get()).exists; tries++;
  }
  if (exists) return res.status(500).json({ error: 'CODE_GEN_FAILED' });

  const now = Timestamp.now();
  const expiresAt = Timestamp.fromDate(new Date(Date.now() + 48*60*60*1000));
  await ref.set({ ownerUid, createdAt: now, expiresAt, redeemedBy: null });
  res.json({ code, expiresAt: expiresAt.toDate().toISOString() });
}));

export const redeemInviteCode = onRequest(withCors(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST_ONLY' });

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace('Bearer ', '');
  const decoded = await getAuth().verifyIdToken(idToken);
  const joinerUid = decoded.uid;

  const { code } = req.body || {};
  if (!code) return res.status(400).json({ error: 'NO_CODE' });

  const ref = db.collection('inviteCodes').doc(String(code).toUpperCase());
  const snap = await ref.get();
  if (!snap.exists) return res.status(404).json({ error: 'INVALID_CODE' });

  const { ownerUid, redeemedBy, expiresAt } = snap.data();
  if (!ownerUid) return res.status(400).json({ error: 'BROKEN_CODE' });
  if (redeemedBy) return res.status(409).json({ error: 'ALREADY_REDEEMED' });
  if (expiresAt.toDate() < new Date()) return res.status(410).json({ error: 'EXPIRED' });
  if (ownerUid === joinerUid) return res.status(400).json({ error: 'SELF_JOIN' });

  const batch = db.batch();
  const now = Timestamp.now();
  batch.set(db.collection('users').doc(ownerUid).collection('cheerSquad').doc(joinerUid), { joinedAt: now }, { merge: true });
  batch.set(db.collection('users').doc(joinerUid).collection('cheerSquad').doc(ownerUid), { joinedAt: now }, { merge: true });
  batch.update(ref, { redeemedBy: joinerUid, redeemedAt: now });
  await batch.commit();

  res.json({ ok: true });
}));

export const removeCheerLink = onRequest(withCors(async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST_ONLY' });

  const authHeader = req.headers.authorization || '';
  const idToken = authHeader.replace('Bearer ', '');
  const decoded = await getAuth().verifyIdToken(idToken);
  const uid = decoded.uid;

  const { otherUid } = req.body || {};
  if (!otherUid || otherUid === uid) return res.status(400).json({ error: 'BAD_TARGET' });

  const batch = db.batch();
  batch.delete(db.collection('users').doc(uid).collection('cheerSquad').doc(otherUid));
  batch.delete(db.collection('users').doc(otherUid).collection('cheerSquad').doc(uid));
  await batch.commit();

  res.json({ ok: true });
}));
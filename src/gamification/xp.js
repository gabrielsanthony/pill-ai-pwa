import { get, set } from '../lib/storage';

const KEY = 'xp';
let listeners = new Set();

export function getXP() {
  return get(KEY, 0) ?? 0;
}

export function addXP(amount = 0, reason = '') {
  const next = Math.max(0, getXP() + (amount || 0));
  set(KEY, next);
  listeners.forEach(fn => fn(next, reason));
  return next;
}

export function levelFromXP(xp) {
  // 100 XP per level — adjust here if needed
  return Math.floor((xp ?? 0) / 100) + 1;
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
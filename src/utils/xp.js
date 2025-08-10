// src/utils/xp.js
// Shim that forwards to the new engine, with a one-time migration of legacy key.

import { get, set } from '../lib/storage.js';

// ---- one-time migration from legacy localStorage key "pillAiXP" ----
const LEGACY_KEY = 'pillAiXP';
try {
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy !== null) {
    const legacyXP = parseInt(legacy || '0', 10) || 0;
    // write into the new storage key "pillai:xp"
    // (gamification/xp.js reads this via storage.get('xp'))
    const current = get('xp', 0) ?? 0;
    if (legacyXP > current) set('xp', legacyXP);
    localStorage.removeItem(LEGACY_KEY);
  }
} catch (_) {
  // ignore migration errors
}

// ---- re-export the new engine ----
export {
  getXP,
  addXP,
  levelFromXP as calculateLevel,
  subscribe,
} from '../gamification/xp.js';
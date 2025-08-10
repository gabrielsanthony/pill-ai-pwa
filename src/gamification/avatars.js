// src/gamification/avatars.js
import { get, set } from '../lib/storage.js';
import { AVATARS } from './schema.js';

const KEY_SELECTED = 'selectedAvatarId';

export function getUnlockedAvatars(xp) {
  return AVATARS.filter(a => xp >= a.xpCost);
}

export function getHighestUnlocked(xp) {
  const unlocked = getUnlockedAvatars(xp);
  return unlocked[unlocked.length - 1] ?? null;
}

export function getSelectedAvatarId() {
  return get(KEY_SELECTED, null);
}

export function selectAvatar(id) {
  set(KEY_SELECTED, id);
}

export function getCurrentAvatar(xp) {
  const selectedId = getSelectedAvatarId();
  if (selectedId) {
    const sel = AVATARS.find(a => a.id === selectedId);
    if (sel && xp >= sel.xpCost) return sel;
  }
  return getHighestUnlocked(xp);
}
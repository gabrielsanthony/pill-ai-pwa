// src/utils/xp.js

export function getXP() {
    return parseInt(localStorage.getItem('pillAiXP') || '0');
}

export function setXP(value) {
  localStorage.setItem('pillAiXP', value);
}

export function addXP(amount) {
  const current = getXP();
  const updated = current + amount;
  setXP(updated);
  return updated;
}

export function calculateLevel(xp) {
  if (xp < 50) return 1;
  if (xp < 150) return 2;
  if (xp < 300) return 3;
  return Math.floor(xp / 150) + 1;
}

// src/utils/xp.js
export { getXP, addXP, levelFromXP as calculateLevel, subscribe } from '../gamification/xp.js';


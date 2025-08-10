// src/lib/storage.js
const PREFIX = 'pillai:';

function safeParse(value, fallback = null) {
  try {
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}

export function get(key, fallback = null) {
  const raw = localStorage.getItem(PREFIX + key);
  return safeParse(raw, fallback);
}

export function set(key, value) {
  localStorage.setItem(PREFIX + key, JSON.stringify(value));
  return value;
}

export function merge(key, partial) {
  const current = get(key, {});
  const next = { ...current, ...partial };
  set(key, next);
  return next;
}

export function reset(key) {
  localStorage.removeItem(PREFIX + key);
}

export function clearAll() {
  Object.keys(localStorage)
    .filter(k => k.startsWith(PREFIX))
    .forEach(k => localStorage.removeItem(k));
}

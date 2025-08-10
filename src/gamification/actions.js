// src/gamification/actions.js
import { get, set, merge } from '../lib/storage';
import { addXP } from './xp';
import { XP_ACTIONS } from './schema';

// Storage keys
const STATS_KEY = 'stats'; // { quizCorrect: number, dosesByDay: { 'YYYY-MM-DD': { [doseId]: true } }, dailyCompleteSet: { 'YYYY-MM-DD': true } }

function todayKey() {
  const d = new Date();
  // local date, zero-pad
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
}

function getStats() {
  return get(STATS_KEY, {
    quizCorrect: 0,
    dosesByDay: {},       // map of day -> { [doseId]: true }
    dailyCompleteSet: {}, // set-like map of day -> true
  });
}

function saveStats(next) {
  set(STATS_KEY, next);
  return next;
}

/**
 * recordEvent(type, payload?)
 * Supported types:
 *  - 'quiz_correct'
 *  - 'dose_on_time'      (pass optional payload.doseId to avoid double credit)
 *  - 'daily_complete'    (awards once per calendar day)
 *  - 'streak_milestone'  (when you *hit* 7/14/30/...; you decide when to call this)
 *
 * Returns: { awardedXP, newXP, skipped, skipReason }
 */
export function recordEvent(type, payload = {}) {
  const action = XP_ACTIONS[type];
  if (!action) {
    return { awardedXP: 0, newXP: null, skipped: true, skipReason: `Unknown action: ${type}` };
  }

  const stats = getStats();
  const day = todayKey();

  // Ensure day containers exist
  stats.dosesByDay[day] ||= {};

  // Default: can award
  let canAward = true;
  let skipReason = '';

  switch (type) {
    case 'quiz_correct': {
      stats.quizCorrect += 1;
      break;
    }
    case 'dose_on_time': {
      // Optional de-dup if caller passes a doseId (e.g., "2025-08-10_08:00")
      const doseId = payload.doseId;
      if (doseId) {
        if (stats.dosesByDay[day][doseId]) {
          canAward = false;
          skipReason = 'Dose already credited for this slot today';
        } else {
          stats.dosesByDay[day][doseId] = true;
        }
      }
      // If no doseId provided, we allow awarding each call
      break;
    }
    case 'daily_complete': {
      if (stats.dailyCompleteSet[day]) {
        canAward = false;
        skipReason = 'Daily completion already credited today';
      } else {
        stats.dailyCompleteSet[day] = true;
      }
      break;
    }
    case 'streak_milestone': {
      // You call this only when you *hit* a milestone, so no internal de-dup here.
      // If you want to prevent re-award, include a unique payload.milestone like "streak_7"
      // and store a set similar to dailyCompleteSet.
      break;
    }
    default:
      break;
  }

  if (!canAward) {
    saveStats(stats);
    return { awardedXP: 0, newXP: null, skipped: true, skipReason };
  }

  // Award XP
  const awardedXP = action.xp || 0;
  const newXP = addXP(awardedXP, type);

  saveStats(stats);
  return { awardedXP, newXP, skipped: false };
}

// Expose read-only stats getter for UI
export function readStats() {
  return getStats();
}

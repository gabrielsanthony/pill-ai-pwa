// src/notifications/nudgeCopy.js

// Set to 2 * 60 * 1000 for testing, then switch back to 2 * 60 * 60 * 1000
export const NUDGE_MS = 2 * 60 * 60 * 1000;

const ENCOURAGEMENTS = [
  "You’ve got this! 🙌",
  "Small steps add up. ✨",
  "Consistency matters. 💪",
  "Your health is worth it. 💚",
  "Nice work staying on track! ✅",
  "Tiny pill, big progress. 🌱",
  "Strong tomorrow starts now. 🔆",
  "Keep the streak going! 🔥"
];

const WHY_TIMING = [
  "Taking it on time helps the medicine work best.",
  "Staying on schedule keeps levels steady.",
  "Delays can reduce how well it works.",
  "Regular timing can lower side-effects.",
  "Keeping to time supports your recovery."
];

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const buildNudgeTitle = (drug) => `⏰ Dose overdue: ${drug}`;
export const buildNudgeBody = (drug) =>
  `Overdue: it’s been 2 hours since your ${drug} dose. ${pick(WHY_TIMING)} ${pick(ENCOURAGEMENTS)} Tap "Meds Taken" when done.`;
// src/gamification/schema.js
// Single source of truth for Pill‑AI gamification
// at the top of src/gamification/schema.js
import placeboImg   from '../assets/avatars/placebo.png';
import firstAidImg  from '../assets/avatars/first-aid.png';
import heartbeatImg from '../assets/avatars/heartbeat.png';
import lifeForceImg from '../assets/avatars/life-force.png';
import panaceaImg   from '../assets/avatars/panacea.png';



export const BADGE_CATEGORIES = {
  STREAK: 'streak',
  QUIZ: 'quiz',
};

// ---- Badges (Duolingo-style: show highest per category) ----
// category: 'streak' uses streakDays threshold
// category: 'quiz'   uses quizCorrect threshold
export const BADGES = [
  // Streak badges
  { id: 'streak_7',    name: 'One-Week Wonder',    category: BADGE_CATEGORIES.STREAK, threshold: 7,    metric: 'streakDays', icon: null },
  { id: 'streak_30',   name: 'Habit Hero',         category: BADGE_CATEGORIES.STREAK, threshold: 30,   metric: 'streakDays', icon: null },
  { id: 'streak_100',  name: 'Marathon Medic',     category: BADGE_CATEGORIES.STREAK, threshold: 100,  metric: 'streakDays', icon: null },
  { id: 'streak_365',  name: 'Year of Health',     category: BADGE_CATEGORIES.STREAK, threshold: 365,  metric: 'streakDays', icon: null },
  { id: 'streak_1825', name: 'Legend of Longevity',category: BADGE_CATEGORIES.STREAK, threshold: 1825, metric: 'streakDays', icon: null },

  // Quiz badges
  { id: 'quiz_1',   name: 'Quiz Rookie',     category: BADGE_CATEGORIES.QUIZ, threshold: 1,  metric: 'quizCorrect', icon: '❓' },
  { id: 'quiz_10',  name: 'Quiz Champ',      category: BADGE_CATEGORIES.QUIZ, threshold: 10, metric: 'quizCorrect', icon: '🎯' },
  { id: 'quiz_50',  name: 'Knowledge Keeper',category: BADGE_CATEGORIES.QUIZ, threshold: 50, metric: 'quizCorrect', icon: '📚' },
];

// Convenience lookups
export const BADGES_BY_ID = Object.fromEntries(BADGES.map(b => [b.id, b]));
export const BADGES_BY_CATEGORY = BADGES.reduce((acc, b) => {
  (acc[b.category] ||= []).push(b);
  return acc;
}, {});

// ---- Avatars (XP-gated cosmetics; users can switch any unlocked) ----
export const AVATARS = [
  { id: 'placebo',    name: 'Placebo',    xpCost: 0,    img: placeboImg,
    description: 'Harmless and humble — your journey to mastery begins.' },
  { id: 'first_aid',  name: 'First Aid',  xpCost: 50,   img: firstAidImg,
    description: 'The first real step in healing — basic but dependable.' },
  { id: 'heartbeat',  name: 'Heartbeat',  xpCost: 150,  img: heartbeatImg,
    description: 'Steady and strong — you’re building healthy momentum.' },
  { id: 'life_force', name: 'Life Force', xpCost: 400,  img: lifeForceImg,
    description: 'Brimming with vitality — your health habits are powerful now.' },
  { id: 'panacea',    name: 'Panacea',    xpCost: 1000, img: panaceaImg,
    description: 'The ultimate cure — wisdom and wellness in perfect harmony.' },
];

export const AVATARS_BY_ID = Object.fromEntries(AVATARS.map(a => [a.id, a]));


// ---- XP Actions (repeatable) ----
export const XP_ACTIONS = {
  quiz_correct:    { id: 'quiz_correct',    xp: 1, description: 'Answer a quiz question correctly' },
  dose_on_time:    { id: 'dose_on_time',    xp: 2, description: 'Mark a scheduled dose as taken on time' },
  daily_complete:  { id: 'daily_complete',  xp: 3, description: 'Complete all doses for the day' },
  streak_milestone:{ id: 'streak_milestone',xp: 5, description: 'Hit a streak milestone (e.g., 7, 14, 30 days)' },
};

// Optional: export a version for future migrations
export const GAMIFICATION_SCHEMA_VERSION = 1;
import EarnCard from './EarnCard.jsx';
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/pill-ai-logo.png'; // ✅ Updated image import
import { requestPermissionAndGetToken } from './firebase-notifications';
import { useSwipeable } from 'react-swipeable';
import { LearnCard } from './LearnCard.jsx';
import { NUDGE_MS } from './notifications/nudgeCopy';
import { scheduleReminder, cancelReminder } from './notifications/api';
import { getMessaging, onMessage } from 'firebase/messaging';
import CheerSquad from './CheerSquad.jsx';
import { completeJoin, addSupportEvent } from './utils/firebase-db';
import Modal from './components/Modal.jsx';
import CheeringHub from './CheeringHub.jsx';
import HowToPillAI from './components/HowToPillAI.jsx';
import PrivacyPolicy from './components/PrivacyPolicy.jsx';
import FAQ from './components/FAQ.jsx';
import InstallAppButton from './InstallAppButton';
import IosInstallHint from './IosInstallHint';


// 🚨 Overdue bookkeeping
const getOverdueMap = () => {
  try { return JSON.parse(localStorage.getItem('overdueMap') || '{}'); }
  catch { return {}; }
};
const setOverdueMap = (m) => localStorage.setItem('overdueMap', JSON.stringify(m));

const getDoseSchedule = () => {
  try { return JSON.parse(localStorage.getItem('doseSchedule') || '[]'); }
  catch { return []; }
};
const getTakenSet = () => new Set(JSON.parse(localStorage.getItem('takenTimestamps') || '[]'));

let overdueCheckInFlight = false;

// 💊 TrackCard Component

function App() {
  const [loading, setLoading] = useState(false);
    const [language, setLanguage] = useState('English');
    const [question, setQuestion] = useState('');
    const [answer, setAnswer] = useState('');
    const [medsTaken, setMedsTaken] = useState(0);
    const [takenTimestamps, setTakenTimestamps] = useState([]);
    const [nextDoseTime, setNextDoseTime] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState('');
    const [isLongTerm, setIsLongTerm] = useState(false);
    const [durationDays, setDurationDays] = useState(7); // Default 7 days
    const [reminderDrug, setReminderDrug] = useState('');
    const [showReminderForm, setShowReminderForm] = useState(false);
    const [timesPerDay, setTimesPerDay] = useState(1);
    const [dailyTimes, setDailyTimes] = useState(['']);
    const [isCourseComplete, setIsCourseComplete] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [activeTab, setActiveTab] = useState('ask'); // Options: ask, track, voice, learn, earn, support
    const [role, setRole] = useState(localStorage.getItem('role') || 'medTaker'); // 'medTaker' | 'supporter'
    const [ownerId, setOwnerId] = useState(localStorage.getItem('ownerId') || null);
    const [ownerName, setOwnerName] = useState(localStorage.getItem('ownerName') || '');
// add this NEW line:
    const [isSupporter, setIsSupporter] = useState(localStorage.getItem('isSupporter') === '1');
    const [slideDir, setSlideDir] = useState('right'); // 'left' or 'right'
    // 🔔 In‑app toast state
    const [toast, setToast] = useState(null);           // { title, body } or null
    const [toastVisible, setToastVisible] = useState(false);
    const [openModal, setOpenModal] = useState(null); // 'instructions' | 'privacy' | 'faq' | null

// ----- i18n helpers -----
const NORMALIZE_LANG = (uiLang) => {
  const map = {
    English: 'English',
    Samoan: 'Samoan',
    Mandarin: 'Chinese (Simplified)', // adjust to what your backend expects
    'Te Reo Māori': 'Māori',          // many models expect "Māori" (or "Te Reo Maori")
    'Te Reo Maori': 'Māori',
  };
  return map[uiLang] || uiLang;
};

const labels = {
  English: {
    tabChat: 'Chat',
    tabTrack: 'Track',
    tabVoice: 'Voice',
    tabLearn: 'Learn',
    tabEarn: 'Earn',
    tabSupport: 'Support',
    languageLabel: 'Language:',
    medicinesChat: 'MEDICINES CHAT',
    askPlaceholder: '💡 Ask a medication related question',
    send: 'Send',
    stop: 'Stop',
    listening: 'Listening…',   // ← add
    thinking: 'Thinking…',     // ← add
    tapToAsk: 'Tap to Ask',
    setReminder: '➕ Set Med Reminder',
    trackYourMedication: '📈 Track Your Medication',
    nextDoseNotSet: 'Next dose: not set',
    overdue: (mins) => `Overdue: ${mins} min ago`,
    nextDoseIn: (time) => `Next dose in: ${time}`,
    medsTaken: 'Meds Taken',
    cancelReminders: 'Cancel Reminders',
    voiceAssistant: 'Voice Assistant',
    howto: 'How-to',
    privacy: 'Privacy',
    faq: 'FAQ',
    greatJob: 'Great job!',
    completedAll: "You've completed all your scheduled doses. Keep up the good work!",
  },
  'Te Reo Māori': {
    tabChat: 'Kōrerorero',
    tabTrack: 'Aroturuki',
    tabVoice: 'Reo',
    tabLearn: 'Ako',
    tabEarn: 'Whiwhi',
    tabSupport: 'Tautoko',
    languageLabel: 'Reo:',
    medicinesChat: 'KŌRERORERO RONGOĀ',
    askPlaceholder: '💡 Pātai mō ngā rongoā',
    send: 'Tukua',
   stop: 'Katia',
    listening: 'E whakarongo ana…',  // ← add
    thinking: 'E whakaaro ana…',     // ← add
    tapToAsk: 'Pāwhiritia kia pātai',
    setReminder: '➕ Tautuhia he Whakamaumahara',
    trackYourMedication: '📈 Aroturuki i ō Rongoā',
    nextDoseNotSet: 'Te horopeta e whai ake nei: kāore anō kia tautuhia',
    overdue: (mins) => `Whakaroa: ${mins} meneti ki muri`,
    nextDoseIn: (time) => `Te horopeta e whai ake nei i: ${time}`,
    medsTaken: 'Kua Tangohia ngā Rongoā',
    cancelReminders: 'Whakakore Whakamaumahara',
    voiceAssistant: 'Kaitautoko Reo',
    howto: 'Me pēhea',
    privacy: 'Tūmataiti',
    faq: 'Ngā Pātai Auau',
    greatJob: 'Tino pai!',
    completedAll: 'Kua oti katoa ō horopeta kua whakaritea. Kia kaha tonu!',
  },
  Samoan: {
    tabChat: 'Talanoa',
    tabTrack: 'Siaki',
    tabVoice: 'Leo',
    tabLearn: 'Aʻoaʻo',
    tabEarn: 'Maua',
    tabSupport: 'Lagolago',
    languageLabel: 'Gagana:',
    medicinesChat: 'TALANOAGA O VAILAʻAU',
    askPlaceholder: '💡 Fesili e uiga i vailaʻau',
    send: 'Auina',
stop: 'Taofi',
    listening: 'Fa‘alogo…',         // ← add
    thinking: 'O lo‘o mafaufau…',    // ← add
    tapToAsk: 'Kiliki e fesili',
    setReminder: '➕ Seti Manatua',
    trackYourMedication: '📈 Siaki au Vailaʻau',
    nextDoseNotSet: 'Taimi e sosoo ai: e leʻi setiina',
    overdue: (mins) => `Faʻatuai: ${mins} minute talu ai`,
    nextDoseIn: (time) => `Taimi e sosoo ai i totonu o: ${time}`,
    medsTaken: 'Ua Inu Vailaʻau',
    cancelReminders: 'Soloia Manatua',
    voiceAssistant: 'Fesoasoani Leo',
    howto: 'Faʻaaogā',
    privacy: 'Tūmataiti',
    faq: 'FAQ',
    greatJob: 'Matagofie!',
    completedAll: 'Ua maeʻa uma au horopeta faatulagaina. Faʻaauau pea!',
  },
  Mandarin: {
    tabChat: '聊天',
    tabTrack: '追踪',
    tabVoice: '语音',
    tabLearn: '学习',
    tabEarn: '奖励',
    tabSupport: '支持',
    languageLabel: '语言：',
    medicinesChat: '用药咨询',
    askPlaceholder: '💡 请输入与用药相关的问题',
    send: '发送',
 stop: '停止',
    listening: '正在聆听…',          // ← add
    thinking: '正在思考…',            // ← add
    tapToAsk: '点击提问',
    setReminder: '➕ 设置提醒',
    trackYourMedication: '📈 用药追踪',
    nextDoseNotSet: '下一次用药：未设置',
    overdue: (mins) => `已超时：${mins} 分钟前`,
    nextDoseIn: (time) => `距离下一次用药：${time}`,
    medsTaken: '已服药',
    cancelReminders: '取消提醒',
    voiceAssistant: '语音助手',
    howto: '使用说明',
    privacy: '隐私',
    faq: '常见问题',
    greatJob: '太棒了！',
    completedAll: '你已完成所有预定剂量，继续保持！',
  },
};

const t = (key, ...args) => {
  const pack = labels[language] || labels.English;
  const v = pack[key] ?? labels.English[key] ?? key;
  return typeof v === 'function' ? v(...args) : v;
};

const BCP47 = {
  English: 'en-US',          // or 'en-NZ' if you prefer
'Te Reo Māori': 'mi-NZ', // more reliable on some browsers
  Samoan: 'sm',
  Mandarin: 'zh-CN',
};


    const toastTimerRef = useRef(null);
    // Guards so we attach each foreground listener exactly once
        const swListenerAttachedRef = useRef(false);
        const onMessageUnsubRef = useRef(null);
        const chatAbortRef = useRef(null); // aborts an in-flight chat stream
        const answerBoxRef = useRef(null);

        // 🔔 Gentle periodic beep while the model is thinking
const thinkingBeepRef = useRef({ ctx: null, intervalId: null });

function playSingleBeep() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    const ctx = thinkingBeepRef.current.ctx || new AC();
    thinkingBeepRef.current.ctx = ctx;
    if (ctx.state === 'suspended') ctx.resume();

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.value = 880;   // A5
    gain.gain.value = 0.002;     // very soft
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    setTimeout(() => { osc.stop(); osc.disconnect(); gain.disconnect(); }, 120);
  } catch {}
}
function startThinkingBeep() {
  if (thinkingBeepRef.current.intervalId) return;
  playSingleBeep();                             // beep immediately
  thinkingBeepRef.current.intervalId = setInterval(playSingleBeep, 3000);
}
function stopThinkingBeep() {
  try { clearInterval(thinkingBeepRef.current.intervalId); } catch {}
  thinkingBeepRef.current.intervalId = null;
  try { thinkingBeepRef.current.ctx?.close(); } catch {}
  thinkingBeepRef.current.ctx = null;
}

     // === modal helpers (must be inside App so they can access setOpenModal) ===
function openModalAndSetHash(kind) {
  setOpenModal(kind);
  const map = { instructions: 'howto', privacy: 'privacy', faq: 'faq' };
  const hash = map[kind] || '';
  if (hash) {
    // setting location.hash guarantees a 'hashchange' event
    location.hash = hash;
  }
}

function closeModalAndClearHash() {
  setOpenModal(null);
  if (location.hash) {
    // clear the fragment without a full reload
    history.replaceState({}, '', location.pathname + location.search);
    // ensure effect runs once more and leaves modal closed
    setTimeout(() => setOpenModal(null), 0);
  }
}

    // Helper to show a toast for a few seconds
    const TOAST_HIDE_MS = 6000;
    function showToast(title, body) {
    setToast({ title, body });
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_HIDE_MS);
    }

// Foreground FCM (page path) → show in-app toast
useEffect(() => {
  if (onMessageUnsubRef.current) return; // already attached
  try {
    const messaging = getMessaging();

    const unsub = onMessage(messaging, (payload) => {
      const title = payload?.data?.title || payload?.notification?.title || 'Pill-AI Reminder';
      const body  = payload?.data?.body  || payload?.notification?.body  || '';

      console.log('[FG] onMessage payload:', payload);
      if (document.visibilityState === 'visible') {
        console.log('[FG] Showing toast from onMessage');
        showToast(title, body);
      } else {
        console.log('[FG] Skipped toast (tab not visible)');
      }
    });

    onMessageUnsubRef.current = unsub;
  } catch (e) {
    console.warn('[PILL-AI] onMessage unavailable:', e);
  }

  return () => {
    try { onMessageUnsubRef.current?.(); } catch {}
    onMessageUnsubRef.current = null;
  };
}, []);

useEffect(() => {
  (async () => {
    try {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('join');
      if (!code) return;

      const supporterName = prompt('Your name (for your friend to see):', 'Alex') || 'Supporter';
      localStorage.setItem('supporterName', supporterName);

      const { ownerId: oid, ownerName: oname } = await completeJoin(code, supporterName);

      const list = JSON.parse(localStorage.getItem('cheeringMemberships') || '[]');
if (!list.find(m => m.ownerId === oid)) list.push({ ownerId: oid, ownerName: oname });
localStorage.setItem('cheeringMemberships', JSON.stringify(list));

      // Persist supporter capability (no nav changes)
      localStorage.setItem('isSupporter', '1');
      localStorage.setItem('ownerId', oid);
      localStorage.setItem('ownerName', oname);

      setIsSupporter(true);
      setOwnerId(oid);
      setOwnerName(oname);

      // Clean URL
      window.history.replaceState({}, '', window.location.origin + window.location.pathname);
    } catch (e) {
      console.error('Join failed:', e);
      alert('This invite link is invalid or expired.');
    }
  })();
}, []);

useEffect(() => {
  const applyFromHash = () => {
    const h = (location.hash || '').slice(1);
    if (h === 'howto') setOpenModal('instructions');
    else if (h === 'privacy') setOpenModal('privacy');
    else if (h === 'faq') setOpenModal('faq');
    else setOpenModal(null);
  };

  // run once for direct loads like /#howto
  applyFromHash();

  // listen to BOTH events
  window.addEventListener('hashchange', applyFromHash);
  window.addEventListener('popstate', applyFromHash);

  return () => {
    window.removeEventListener('hashchange', applyFromHash);
    window.removeEventListener('popstate', applyFromHash);
  };
}, []);

useEffect(() => {
  if (activeTab === 'voice' && !isListening && loading) {
    startThinkingBeep();
  } else {
    stopThinkingBeep();
  }
  return () => stopThinkingBeep();
}, [activeTab, isListening, loading]);

useEffect(() => {
  const onKey = (e) => {
    if (e.key === 'Escape') { closeModalAndClearHash(); return; }
    // don’t trigger when typing in inputs/textareas
    const t = e.target;
    if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;

    const k = e.key.toLowerCase();
    if (k === 'h') openModalAndSetHash('instructions');    // h = How-to
    if (k === 'p') openModalAndSetHash('privacy');          // p = Privacy
    if (e.key === '?' || (e.shiftKey && e.key === '/')) {   // ? = FAQ
      e.preventDefault();
      openModalAndSetHash('faq');
    }
  };
  window.addEventListener('keydown', onKey);
  return () => window.removeEventListener('keydown', onKey);
}, []);

const goToTab = (newTab, dir) => {
  if (dir) {
    // when caller knows swipe direction (left/right)
    setSlideDir(dir);
  } else {
    // when clicking tab buttons (no wrap); pick best direction
    const oldIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    const len = tabOrder.length;
    const forward  = (newIndex - oldIndex + len) % len;   // moving right
    const backward = (oldIndex - newIndex + len) % len;   // moving left
    setSlideDir(forward <= backward ? 'right' : 'left');
  }
  setActiveTab(newTab);
};


    const tabOrder = ['ask', 'track', 'voice', 'learn', 'earn', 'support'];
    // 👇 add these helpers right after tabOrder
    const nextTabOf = (cur) => {
    const i = tabOrder.indexOf(cur);
    return tabOrder[(i + 1) % tabOrder.length];
    };
    const prevTabOf = (cur) => {
    const i = tabOrder.indexOf(cur);
    return tabOrder[(i - 1 + tabOrder.length) % tabOrder.length];
    };

    const handlers = useSwipeable({
    // left swipe moves to the next tab (wraps); animate as sliding right
    onSwipedLeft: () => goToTab(nextTabOf(activeTab), 'right'),
    // right swipe moves to the previous tab (wraps); animate as sliding left
    onSwipedRight: () => goToTab(prevTabOf(activeTab), 'left'),
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
    });


    const hasReminder =
        reminderDrug &&
        (isLongTerm || (durationDays && durationDays > 0)) &&
        timesPerDay > 0;

        function extractMedicineName(answer) {
        if (!answer) return '';
        const match = answer.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?)\b/);
        return match ? match[0] : '';
        }

        // 📅 Extract "for X days" / "X days" / "X weeks" / long-term phrases
function extractDuration(text) {
  if (!text || typeof text !== 'string') {
    return { isLongTerm: false, days: null };
  }

  if (/\blong[-\s]?term\b/i.test(text) || /\bindefinite\b/i.test(text)) {
    return { isLongTerm: true, days: null };
  }

  const wk = text.match(/\b(\d+)\s*weeks?\b/i);
  if (wk) return { isLongTerm: false, days: parseInt(wk[1], 10) * 7 };

  const d1 = text.match(/\bfor\s+(\d+)\s*days?\b/i);
  if (d1) return { isLongTerm: false, days: parseInt(d1[1], 10) };

  const d2 = text.match(/\b(\d+)\s*days?\b/i);
  if (d2) return { isLongTerm: false, days: parseInt(d2[1], 10) };

  return { isLongTerm: false, days: null };
}

// --- Client-side cleaners used for streamed text ---
function stripInlineCitationsUI(s = '') {
  return String(s)
    // remove bracketed inline citations like  or [1]
    .replace(/\s*[【\[][^】\]\n]{1,120}[】\]]/g, '')
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tidyStyleUI(s = '') {
  let out = String(s).replace(/\r/g, '');

  // remove bullets/emojis at line starts
  out = out
    .replace(/^\s*(✅|📌|⚠️|👉|🔹|•|\*|–|—)\s*/gm, '')
    .replace(/(✅|📌|⚠️|👉|🔹)/g, '');

  // normalize "- " bullets and spacing
  out = out.replace(/([:.!?])\s*-\s+/g, '$1\n- ');
  out = out.replace(/\s+-\s+(?=[A-Za-z(])/g, '\n- ');
  out = out.replace(/-\s+/g, '- ');
  out = out.replace(/\n{3,}/g, '\n\n');
  out = out.replace(/\n(?!-|\n)/g, ' ');
  out = out.replace(/[ \t]+/g, ' ').trim();
  out = out.replace(/\s*source:\s*/i, '\nSource: ');

  return out;
}


    // ✅ Only allow Meds Taken button if within 30 min of next dose
function isDoseWindowOpen() {
  if (!nextDoseTime) return false;
  const doseDate = nextDoseTime instanceof Date ? nextDoseTime : new Date(nextDoseTime);
  const now = Date.now();
  const diffMins = Math.abs((doseDate.getTime() - now) / 60000); // 60000 ms per minute
  const key = doseDate.toISOString(); // matches how takenTimestamps are stored
  return diffMins <= 30 && !takenTimestamps.includes(key);
}

// ✅ Find past-due, not-yet-taken doses and fire an "Overdue" push now
async function checkAndHandleOverdueDoses() {
  const schedule = getDoseSchedule();            // array of ISO strings (main reminder times)
  if (!Array.isArray(schedule) || schedule.length === 0) return;

  const takenSet = getTakenSet();                // ISO strings you already store
  const overdueMap = getOverdueMap();            // doseISO -> true (already alerted)
  const now = Date.now();

  // Only consider overdue in the last 24h to avoid spamming very old entries
  const cutoff = now - 24 * 60 * 60 * 1000;

  // Find main dose timestamps that are past, not taken, and not already overdue-notified
  const overdueList = schedule
    .filter(ts => {
      const t = new Date(ts).getTime();
      return t <= now && t >= cutoff && !takenSet.has(ts) && !overdueMap[ts];
    })
    .sort((a, b) => new Date(a) - new Date(b));

  if (overdueList.length === 0) return;

  const token = await requestPermissionAndGetToken();
  if (!token) {
    console.warn('[PILL-AI] No push token; cannot send overdue notifications.');
    return;
  }

  for (const mainISO of overdueList) {
    try {
      // Fire an "Overdue" notification ~5s from now so it queues reliably
      const sendAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();
      const title = `⏰ Overdue: ${reminderDrug || 'Your medication'}`;
      const body  = `You missed your scheduled dose. Tap to mark taken or get back on track.`;

await scheduleReminder({
  token, title, body, sendAt, tag: `dose:${mainISO}:od1`,
});

// 🆕 also notify supporters (MVP)
try {
  if (ownerId) {
    await addSupportEvent(ownerId, {
      type: 'NUDGE_REQUEST',
      doseTimeISO: mainISO,
      message: `Dose overdue: ${reminderDrug || 'med'} scheduled ${new Date(mainISO).toLocaleTimeString()}`
    });
  }
} catch (e) {
  console.warn('NUDGE_REQUEST write failed:', e);
}

// Mark this dose as alerted so we don't duplicate
overdueMap[mainISO] = true;

    } catch (err) {
      console.error('❌ Failed to schedule overdue notification for', mainISO, err);
    }
  }
  setOverdueMap(overdueMap);
}

async function handleVoiceQuery(transcript) {
  const q = (transcript || '').trim();
  if (!q) return;
 await streamAnswerForText(q, { speak: true }); // ← speak only for Voice tab
}

// Streams a question string and fills `answer` as chunks arrive.
// If options.speak === true, read the final answer aloud (used by Voice tab only).
async function streamAnswerForText(initialQuestion, options = {}) {
  const speak = !!options.speak;

  // cancel any in-flight request and any ongoing speech
  try { chatAbortRef.current?.abort(); } catch {}
  try { window.speechSynthesis?.cancel(); } catch {}

  const controller = new AbortController();
  chatAbortRef.current = controller;

  if (initialQuestion) setQuestion(initialQuestion);

const payload = {
  question: initialQuestion || question,
  language: NORMALIZE_LANG(language),
  simplify: true,
  memory: false
};

  setAnswer('');
  setShowReminderForm(false);
  setLoading(true);

  try {
    const res = await fetch('/api/chat?stream=1', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'text/plain'        // 👈 stream is plain text
  },
  body: JSON.stringify(payload),
  signal: controller.signal,
  cache: 'no-store'               // 👈 avoid intermediaries buffering
});

    if (!res.ok || !res.body) {
      const txt = await res.text().catch(() => '');
      setAnswer(txt || '⚠️ Error fetching response');
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder();

    let done = false;
    let fullText = '';

    while (!done) {
      const { value, done: d } = await reader.read();
      done = d;
      if (value) {
        const chunk = decoder.decode(value, { stream: !done });
        fullText += chunk;

        // ✂️ Clean as it streams (remove citations, tidy bullets/spacing)
        const cleaned = tidyStyleUI(stripInlineCitationsUI(fullText));
        setAnswer(cleaned);
      }
    }

    // If the stream produced no text (edge runtimes, proxies), fall back to non-stream
if (!fullText.trim()) {
  try {
    const r2 = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const j = await r2.json().catch(() => null);
    setAnswer(j?.answer || '⚠️ No response received.');
  } catch {
    setAnswer('⚠️ Network error.');
  }
}

    // Speak only if this was a voice-initiated query
    if (speak) {
      const finalCleaned = tidyStyleUI(stripInlineCitationsUI(fullText || ''));
      setTimeout(() => speakAnswer(finalCleaned), 0);
    }
  } catch (err) {
    if (err?.name !== 'AbortError') {
      console.error(err);
      setAnswer('⚠️ Network error.');
    }
  } finally {
    setLoading(false);
    if (chatAbortRef.current === controller) chatAbortRef.current = null;
  }
}


async function submitQuestionStreaming(e) {
  e.preventDefault();
  const q = (question || '').trim();
  if (!q) return;           // ignore empty submits
  await streamAnswerForText('');  // use current `question` state
}

function speakAnswer(text) {
  const utterance = new SpeechSynthesisUtterance(text);
  const lang = BCP47[language] || 'en-US';
  utterance.lang = lang;

  // Try to pick a matching voice if available
  const chooseVoice = () => {
    const voices = speechSynthesis.getVoices?.() || [];
    const exact = voices.find(v => v.lang?.toLowerCase() === lang.toLowerCase());
    const prefix = voices.find(v => v.lang?.toLowerCase().startsWith(lang.split('-')[0].toLowerCase()));
 utterance.voice = exact || prefix || null;
// subtle ping when TTS begins
utterance.onstart = () => { try { playSingleBeep(); } catch {} };
speechSynthesis.speak(utterance);
  };

  // Some browsers load voices asynchronously
  if (!speechSynthesis.getVoices || speechSynthesis.getVoices().length > 0) {
    chooseVoice();
  } else {
    const handler = () => { try { chooseVoice(); } finally { speechSynthesis.removeEventListener('voiceschanged', handler); } };
    speechSynthesis.addEventListener('voiceschanged', handler);
  }
}

    // 🔁 Restore progress from localStorage
    useEffect(() => {
        const saved = localStorage.getItem('medsTaken');
        const reminder = JSON.parse(localStorage.getItem("activeReminder"));
        if (saved && reminder && reminder.days && reminder.timesPerDay) {
            const totalDoses = reminder.days * reminder.timesPerDay;
            const taken = Number(saved);
            setMedsTaken(taken);
            const takenList = JSON.parse(localStorage.getItem("takenTimestamps")) || [];
            setTakenTimestamps(takenList);
            if (taken >= totalDoses) {
                setIsCourseComplete(true);
            }
        }
    }, []);

    // 🎯 Send CHEER_REQUEST at progress milestones
// Normal: 25/50/75/100%
// Fast mode: add ?fast=1 to URL → 10/20/30/40% for demo
useEffect(() => {
  if (!ownerId) return;

  const total = (durationDays || 0) * (timesPerDay || 0);
  if (!total) return;

  // Option B: URL switch to accelerate milestones for demo
  const params = new URLSearchParams(window.location.search);
  const FAST = params.has('fast'); // e.g. https://yourapp.vercel.app/?fast=1
  const MILESTONES = FAST ? [10, 20, 30, 40] : [25, 50, 75, 100];

  const progress = Math.floor((medsTaken / total) * 100);
  const last = Number(localStorage.getItem('lastCheerMilestone') || 0);
  const nextMilestone = MILESTONES.find(m => progress >= m && m > last);
  if (!nextMilestone) return;

  addSupportEvent(ownerId, {
    type: 'CHEER_REQUEST',
    milestone: nextMilestone,
    message: `Reached ${nextMilestone}% of the course for ${reminderDrug || 'your meds'}.`
  }).catch(err => console.error('CHEER_REQUEST write failed:', err));

  localStorage.setItem('lastCheerMilestone', String(nextMilestone));
}, [medsTaken, durationDays, timesPerDay, ownerId, reminderDrug]);

    useEffect(() => {
        const reminder = JSON.parse(localStorage.getItem("activeReminder"));
        if (!reminder || !reminder.days || !reminder.timesPerDay) return;

        const { days, timesPerDay } = reminder;
        const today = new Date();
        const now = today.getTime();

        // Build all future dose times
        const futureTimes = [];
        for (let d = 0; d < days; d++) {
            for (let t of dailyTimes) {
                if (!t) continue;
                const [hh, mm] = t.split(":").map(Number);
                const dose = new Date();
                dose.setDate(today.getDate() + d);
                dose.setHours(hh, mm, 0, 0);
                if (dose.getTime() > now) {
                    futureTimes.push(dose);
                }
            }
        }

        if (futureTimes.length > 0) {
            const next = futureTimes.sort((a, b) => a - b)[0];
            setNextDoseTime(next);
        }
    }, [dailyTimes]);

// [PILL-AI] Live countdown
useEffect(() => {
  if (!nextDoseTime) return;

  const tick = () => {
    const target = nextDoseTime instanceof Date ? nextDoseTime : new Date(nextDoseTime);
    const diff = target.getTime() - Date.now();

    if (diff <= 0) {
      setTimeRemaining('due now');
      return;
    }

    const totalMin = Math.floor(diff / 60000);
    const hrs = Math.floor(totalMin / 60);
    const mins = totalMin % 60;
    setTimeRemaining(`${hrs > 0 ? `${hrs}h ` : ''}${mins}m`);
  };

  tick(); // set immediately
  const id = setInterval(tick, 1000);
  return () => clearInterval(id);
}, [nextDoseTime]);

// [PILL-AI] When a dose just became overdue, schedule the overdue push immediately
useEffect(() => {
  if (!nextDoseTime) return;

  const t = (nextDoseTime instanceof Date ? nextDoseTime : new Date(nextDoseTime)).getTime();
  const now = Date.now();

  // If we just crossed into overdue (within last 2 minutes), run the check now.
  if (t <= now && (now - t) < 2 * 60 * 1000) {
    checkAndHandleOverdueDoses(); // deduped by overdueMap, safe to call
  }
}, [timeRemaining, nextDoseTime]);

// [PILL-AI] If the current nextDoseTime is past, jump to the next scheduled dose
useEffect(() => {
  if (!nextDoseTime) return;

  const t = (nextDoseTime instanceof Date ? nextDoseTime : new Date(nextDoseTime)).getTime();
  const now = Date.now();

  // If it's in the past but within the 30-min window, keep this dose active.
  const withinGrace = t <= now && (now - t) <= 30 * 60 * 1000;
  if (withinGrace) return;

  // If it's older than the 30-min window, advance to the next future dose.
  if (t <= now) {
    const schedule = JSON.parse(localStorage.getItem('doseSchedule') || '[]');
    const next = schedule
      .map(ts => new Date(ts))
      .filter(d => d.getTime() > now)
      .sort((a, b) => a - b)[0];

    if (next) {
      setNextDoseTime(next);
      localStorage.setItem('nextDoseTime', next.toISOString());
    } else {
      setNextDoseTime(null);
      localStorage.removeItem('nextDoseTime');
    }
  }
}, [nextDoseTime, timeRemaining]);

    // 🧠 Restore reminder info from localStorage on load
    useEffect(() => {
        setTimeout(() => {
            const stored = localStorage.getItem("activeReminder");
            if (stored) {
                const { medicine, days, timesPerDay, dailyTimes: storedTimes } = JSON.parse(stored);
                console.log("🔄 Restoring reminder from localStorage:", { medicine, days, timesPerDay, storedTimes });
                setReminderDrug(medicine);
                setDurationDays(days);
                setTimesPerDay(timesPerDay);
                if (storedTimes && Array.isArray(storedTimes)) {
                    setDailyTimes(storedTimes);
                } else {
                    setDailyTimes(Array(timesPerDay).fill(''));
                }
            }
        }, 300);
    }, []);

    // [PILL-AI] Restore nextDoseTime on load (or compute from doseSchedule)
useEffect(() => {
  const saved = localStorage.getItem('nextDoseTime');
  if (saved) {
    setNextDoseTime(new Date(saved)); // keep as Date object
    return;
  }
  const schedule = JSON.parse(localStorage.getItem('doseSchedule') || '[]');
  if (Array.isArray(schedule) && schedule.length) {
    const next = schedule
      .map(ts => new Date(ts))
      .filter(d => d.getTime() > Date.now())
      .sort((a, b) => a - b)[0];
    if (next) setNextDoseTime(next);
  }
}, []);


    // ⬇️ ADD THIS BELOW your first useEffect block
useEffect(() => {
  if (!loading && answer) {
    const name = extractMedicineName(answer);
    const { isLongTerm: LT, days } = extractDuration(answer);

    if (name) setReminderDrug(name);
    if (LT) {
      setIsLongTerm(true);
    } else if (Number.isFinite(days) && days > 0) {
      setIsLongTerm(false);
      setDurationDays(days);
    }
  }
}, [answer, loading]);

    // ✅ Automatically request permission + save push token on app load
    useEffect(() => {
        const setupNotifications = async () => {
            const token = await requestPermissionAndGetToken();
            if (token) {
                const res = await fetch('/api/savePushToken', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ token }),
                });

                const result = await res.json();
                console.log('📦 Push token saved:', result);
            } else {
                console.warn('❌ No push token available');
            }
        };
        setupNotifications();
    }, []);

// 📡 SW → Page messages (push handled by SW and forwarded via postMessage)
useEffect(() => {
  if (swListenerAttachedRef.current) return; // already attached
  const onSwMessage = (evt) => {
    const msg = evt?.data;
    if (!msg || !msg.type) return;

    console.log('[FG] SW message:', msg);

    if (msg.type === 'REMINDER') {
      const p = msg.payload || {};
      const title = p.title || 'Reminder';
      const body  = p.body  || '';
      if (document.visibilityState === 'visible') {
        console.log('[FG] Showing toast from SW→page');
        showToast(title, body);
      } else {
        console.log('[FG] Skipped toast (tab not visible)');
      }
    
} else if (msg.type === 'REMINDER_CLICK') {
  console.log('[FG] SW notification clicked; tag=', msg.tag);

  // Switch to Track tab (uses your tab animation logic)
  goToTab('track');

  // Scroll to the progress section after the tab renders
  setTimeout(() => {
    const el =
      document.getElementById('progress-section') ||
      document.querySelector('.progress-section');
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 0);
}


  };

  try {
    navigator.serviceWorker?.addEventListener('message', onSwMessage);
    swListenerAttachedRef.current = true;
  } catch (e) {
    console.warn('[PILL-AI] Could not attach SW→page listener:', e);
  }

  return () => {
    try { navigator.serviceWorker?.removeEventListener('message', onSwMessage); } catch {}
    swListenerAttachedRef.current = false;
  };
}, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("🛑 Speech Recognition not supported in this browser");
            return;
        }

const recognition = new SpeechRecognition();
recognition.lang = BCP47[language] || 'en-US';
recognition.interimResults = false;
recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
             stopThinkingBeep();     // ⬅️ add this line
            console.log("🎙️ Listening...");
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log("🛑 Stopped listening");
        };

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  console.log("🗣️ You said:", transcript);

  // start the gentle “thinking” beep immediately
  try { if (activeTab === 'voice') startThinkingBeep(); } catch {}

  handleVoiceQuery(transcript);
};

        // Store in window for global access
        window.recognition = recognition;
    }, []);

    useEffect(() => {
  if (window.recognition) {
    try { window.recognition.lang = BCP47[language] || 'en-US'; } catch {}
  }
}, [language]);

    // ▶️ Run overdue catch-up on load
useEffect(() => {
  checkAndHandleOverdueDoses();
}, []);

// ⏱️ Re-check every minute (tab may be open but sleeping)
useEffect(() => {
  const id = setInterval(() => {
    checkAndHandleOverdueDoses();
  }, 60 * 1000);
  return () => clearInterval(id);
}, []);

// 👀 Also re-check whenever the tab becomes active/visible
useEffect(() => {
  const onVis = () => {
    if (document.visibilityState === 'visible') {
      checkAndHandleOverdueDoses();
    }
  };
  document.addEventListener('visibilitychange', onVis);
  return () => document.removeEventListener('visibilitychange', onVis);
}, []);

const nextDoseMs = nextDoseTime
  ? (nextDoseTime instanceof Date ? nextDoseTime.getTime() : new Date(nextDoseTime).getTime())
  : null;

    return (
        <div className="main-wrapper">
            <div className="app-container">
 <header className="header">
  <img src={logo} alt="Pill-AI Logo" className="logo" />
  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
    <div className="language-selector">
      <label htmlFor="language" style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
        🌐 {t('languageLabel')}
      </label>
      <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
        <option value="English">English</option>
        <option value="Te Reo Māori">Te Reo Māori</option>
        <option value="Samoan">Samoan</option>
        <option value="Mandarin">Mandarin</option>
      </select>
    </div>

    {/* 👉 Install entry point in the header */}
    <InstallAppButton />
  </div>
</header>
<IosInstallHint />

        {/* 🔔 In‑app toast (appears when the page is visible) */}
        {toast && (
        <div
            role="status"
            aria-live="polite"
            style={{
            position: 'fixed',
            left: '50%',
            top: '12px',
            transform: 'translateX(-50%)',
            minWidth: '260px',
            maxWidth: '90vw',
            padding: '12px 14px',
            borderRadius: '10px',
            background: 'rgba(0,0,0,0.85)',
            color: 'white',
            boxShadow: '0 6px 18px rgba(0,0,0,0.25)',
            opacity: toastVisible ? 1 : 0,
            transition: 'opacity 200ms ease',
            zIndex: 9999
            }}
        >
            <div style={{ fontWeight: 700, marginBottom: 4 }}>
            {toast.title || 'Reminder'}
            </div>
            <div style={{ fontSize: 14 }}>
            {toast.body || ''}
            </div>
        </div>
        )}

{/* DEV: quick toast test (remove later) */}
<button
  type="button"
  style={{
    position: 'fixed',
    right: 12,
    bottom: 12,
    padding: '8px 12px',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    opacity: 0.6,
    boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
    zIndex: 9999
  }}
  onClick={() => showToast('Test Toast', 'If you see this, foreground UI works.')}
  aria-label="Show test toast"
  title="Show test toast"
>
  ▶️ Test Toast
</button>


                <div className="tab-bar">
                     <button className={activeTab === 'ask' ? 'tab active' : 'tab'} onClick={() => goToTab('ask')}>💬 {t('tabChat')}</button>
                        <button className={activeTab === 'track' ? 'tab active' : 'tab'} onClick={() => goToTab('track')}>💊 {t('tabTrack')}</button>
                        <button className={activeTab === 'voice' ? 'tab active' : 'tab'} onClick={() => goToTab('voice')}>🎙️ {t('tabVoice')}</button>
                        <button className={activeTab === 'learn' ? 'tab active' : 'tab'} onClick={() => goToTab('learn')}>📘 {t('tabLearn')}</button>
                        <button className={activeTab === 'earn' ? 'tab active' : 'tab'} onClick={() => goToTab('earn')}>🏆 {t('tabEarn')}</button>
                        <button className={activeTab === 'support' ? 'tab active' : 'tab'} onClick={() => goToTab('support')}>🤝 {t('tabSupport')}</button>
                </div>
            
            <div className="card-viewport">
            <div {...handlers} className={`swipe-wrapper slide-${slideDir}`} key={activeTab}>
                {/* keep ALL your existing tab conditionals here */}
            {activeTab === 'ask' && (
                
<form
  className="card ask-card"
  onSubmit={submitQuestionStreaming}
>

                    <h2 className="card-title">💬 {t('medicinesChat')}</h2>

                    <div className="form-group">
                        <input
                            type="text"
                            className="question-input"
                            placeholder={t('askPlaceholder')}
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

<button className="send-button" type="submit" disabled={loading}>
  {loading ? t('thinking') : t('send')}
</button>

{loading && (
  <button
    type="button"
    className="cancel-button small"
    onClick={() => {
      try { chatAbortRef.current?.abort(); } catch {}
    }}
    style={{ marginLeft: 8 }}
  >
    ⛔ {t('stop')}
  </button>
)}

{answer && (() => {
  // Keep your existing spacing tweaks
  const formatted = String(answer)
    // blank line before typical caution/safety sentences
    .replace(
      /\n(?=(Please check|If you experience|If you have any|It('?|’)s important|Seek medical|Talk to your|Consult (a|your) pharmacist|Consult (a|your) doctor))/i,
      '\n\n'
    )
    // blank line before the Source line
    .replace(/\n(?=Source:\s*Medsafe)/i, '\n\n');

  // Split out the "Source: Medsafe..." line so we can style it separately
  const m = formatted.match(/^(.*?)(\n+\s*Source:\s*Medsafe.*)$/is);
  const body   = m ? m[1].trimEnd() : formatted;
  const source = m ? m[2].trimStart() : '';

  return (
    <div>
<div className="answer-box" ref={answerBoxRef}>
  <p className="answer-text">{body}</p>
  {source && (
    <div
      className="answer-source"
      style={{ borderTop: '1px solid #eee', marginTop: 12, paddingTop: 10, color: '#555' }}
    >
      {source}
    </div>
  )}
</div>

    </div>
  );
})()}


                </form>
                )}
                {activeTab === 'track' && (
                <div className="card track-card">
                {showReminderForm && (
                    <div className="reminder-form">
                        <h3>⏰ Set a Medication Reminder</h3>

                        <div className="form-group">
                            <label>💊 Medicine Name:</label>
                            <input
                                type="text"
                                placeholder="e.g. Amoxicillin"
                                value={reminderDrug}
                                onChange={(e) => setReminderDrug(e.target.value)}
                            />
                        </div>

                        <div className="form-group">
                            <label>
                                <input
                                    type="checkbox"
                                    checked={isLongTerm}
                                    onChange={() => setIsLongTerm(!isLongTerm)}
                                />
                                📆 Long Term Medication
                            </label>
                        </div>

                        {!isLongTerm && (
                            <div className="form-group">
                                <label>📅 Duration (days):</label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={durationDays}
                                    onChange={(e) => setDurationDays(Number(e.target.value))}
                                />
                            </div>
                        )}

                        <div className="form-group">
                            <label>🔁 Times per Day:</label>
                            <select
                                value={timesPerDay}
                                onChange={(e) => {
                                    const newTimes = parseInt(e.target.value);
                                    setTimesPerDay(newTimes);
                                    setDailyTimes(Array(newTimes).fill(''));
                                }}
                            >
                                {[1, 2, 3, 4].map((num) => (
                                    <option key={num} value={num}>{num}</option>
                                ))}
                            </select>
                        </div>

                        {dailyTimes.map((time, idx) => (
                            <div className="form-group" key={idx}>
                                <label>🕒 Time {idx + 1}:</label>
                                <input
                                    type="time"
                                    value={time}
                                    onChange={(e) => {
                                        const updated = [...dailyTimes];
                                        updated[idx] = e.target.value;
                                        setDailyTimes(updated);
                                    }}
                                />
                            </div>
                        ))}

                        <button
                            className="send-button"
                            onClick={async () => {
                                console.log("💾 Saving reminder:", {
                                    reminderDrug,
                                    isLongTerm,
                                    durationDays: isLongTerm ? 'Long Term' : durationDays,
                                    timesPerDay,
                                    dailyTimes,
                                });

                                // 🧠 Save reminder info locally for progress tracking
                                const reminderInfo = {
                                    medicine: reminderDrug,
                                    days: isLongTerm ? 30 : durationDays,
                                    timesPerDay: timesPerDay
                                };
                                localStorage.setItem("activeReminder", JSON.stringify({
                                    ...reminderInfo,
                                    dailyTimes
                                }));

                                // 🧹 Reset medsTaken progress
                                setMedsTaken(0);
                                setIsCourseComplete(false); // 🔄 Reset progress bar visibility for new reminder
                                localStorage.removeItem("medsTaken");

                                const token = await requestPermissionAndGetToken();

                                if (!token) {
                                    alert("❌ Could not get push token. Reminder not saved.");
                                    return;
                                }


                                const now = new Date();
                                const daysToSchedule = isLongTerm ? 30 : durationDays;

                                const remindersToSchedule = [];
                                const mainReminders = [];
                                try {
                                    for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
                                        for (const time of dailyTimes) {
                                            if (!time) continue;
                                            const [hour, minute] = time.split(":").map(Number);
                                            const scheduled = new Date(now);
                                            scheduled.setDate(scheduled.getDate() + dayOffset);
                                            scheduled.setHours(hour, minute, 0, 0);
                                        
    if (scheduled > now) {
  const mainISO = scheduled.toISOString(); // 👈 capture main ISO once

  // MAIN reminder
const main = {
  token,
  title: `🕒 Pill Reminder: ${reminderDrug}`,
  body: `Take ${reminderDrug} at ${time}`,
  sendAt: mainISO,
  tag: `dose:${mainISO}:t0`
};
remindersToSchedule.push(main);
mainReminders.push(main);
}
    }
  }                                      
                                   // POST ALL reminders (main + nudge) via helper
  for (const r of remindersToSchedule) {
      await scheduleReminder(r);
  }

  // 🧠 Store ONLY main dose times for the app's logic
  const doseTimestamps = mainReminders.map(r => r.sendAt);
  localStorage.setItem("doseSchedule", JSON.stringify(doseTimestamps));

  // ⏱️ [PILL-AI] Set initial next dose for the countdown
try {
  const upcoming = doseTimestamps
    .map(ts => new Date(ts))
    .filter(d => d.getTime() > Date.now())
    .sort((a, b) => a - b)[0] || null;

  if (upcoming) {
    setNextDoseTime(upcoming);              // keep as Date object
    setTimeRemaining('');                   // will be recalculated by the countdown effect
    localStorage.setItem('nextDoseTime', upcoming.toISOString());
  } else {
    setNextDoseTime(null);
    localStorage.removeItem('nextDoseTime');
  }
} catch (e) {
  console.warn('[PILL-AI] Could not initialize nextDoseTime:', e);
}


  console.log("🧠 Stored dose timestamps (main only):", doseTimestamps);

  alert(`✅ ${remindersToSchedule.length} reminders scheduled for ${reminderDrug}`);
  setShowReminderForm(false);
} catch (err) {
  console.error("❌ Reminder scheduling error:", err);
  alert("❌ Error while saving reminder");
}


                                setShowReminderForm(false); // ✅ Add this line here

                            }}
                        >
                            Save Reminder
                        </button>

                        <p className="warning">
                            ⚠️ <strong>Pill-AI is a prototype for testing purposes only and MUST NOT be relied upon for health advice.</strong>
                            Please contact your doctor or pharmacist if you have any questions about your health or medications.
                        </p>
                    </div>
                )}

                {/* ✅ Progress Tracking UI */}
                <div id="progress-section" className="progress-section">
                    <h3>📈 {t('trackYourMedication')}</h3>

                    {!showReminderForm && (
                        <button
                            className="send-button"
                            onClick={() => {
                                // ✅ Clear previous values
                                setReminderDrug('');
                                setIsLongTerm(false);
                                setDurationDays(7);
                                setTimesPerDay(1);
                                setDailyTimes(['']);
                                setShowReminderForm(true); // Show the form
                            }}
                            style={{ marginBottom: '10px' }}
                        >
                            ➕ {t('setReminder')}
                        </button>
                    )}

                    {hasReminder && !isCourseComplete && (
                        <>
                            <progress max="100" value={((medsTaken || 0) / ((durationDays || 1) * (timesPerDay || 1))) * 100}></progress>
                            <p>{Math.floor((medsTaken / (durationDays * timesPerDay)) * 100)}% of your meds journey completed</p>
                        </>
                    )}

                    {isDoseWindowOpen() ? (
                        <div>
                            <button
                                className="send-button"
                                onClick={async () => {
                                    if (isCourseComplete || !nextDoseTime) return;

                                const token = await requestPermissionAndGetToken();

// Cancel the main reminder via helper
try {
  await cancelReminder({ token, timestamp: nextDoseTime.toISOString() });
} catch (err) {
  console.error("❌ Failed to cancel main reminder:", err);
}

// Cancel the 2h nudge tied to this dose
try {
  const nudgeTs = new Date(new Date(nextDoseTime).getTime() + NUDGE_MS).toISOString();
  await cancelReminder({ token, timestamp: nudgeTs });
} catch (err) {
  console.warn("⚠️ Could not cancel nudge (maybe already delivered).", err);
}

                                    const takenList = [...takenTimestamps, nextDoseTime.toISOString()];
                                    const updated = medsTaken + 1;
                                    const total = durationDays * timesPerDay;

                                    setTakenTimestamps(takenList);
                                    setMedsTaken(updated);
                                    localStorage.setItem("medsTaken", updated);
                                    localStorage.setItem("takenTimestamps", JSON.stringify(takenList));

                                    // 💾 Remove current dose from doseSchedule
                                    const schedule = JSON.parse(localStorage.getItem("doseSchedule")) || [];
                                    const updatedSchedule = schedule.filter(ts => ts !== nextDoseTime.toISOString());
                                    localStorage.setItem("doseSchedule", JSON.stringify(updatedSchedule));

                                    // ⏭️ Set nextDoseTime to next future dose
                                    const now = new Date().getTime();
                                    const next = updatedSchedule
                                        .map(ts => new Date(ts))
                                        .sort((a, b) => a - b)
                                        .find(d => d.getTime() > now);

                                    if (next) {
  setNextDoseTime(next);
  localStorage.setItem('nextDoseTime', next.toISOString());
} else {
  setNextDoseTime(null);
  localStorage.removeItem('nextDoseTime');
}

                                    // ✅ Check if course is done
                                    if (updated >= total) {
                                        setIsCourseComplete(true);
                                    }
                                }}
                            >
                                ✅ {t('medsTaken')}
                            </button>

                            {/* 🔒 Reset button removed for production
<button
    className="cancel-button"
    onClick={() => {
        if (window.confirm("Reset your progress?")) {
            setMedsTaken(0);
            setTakenTimestamps([]);
            localStorage.setItem("medsTaken", 0);
            localStorage.setItem("takenTimestamps", JSON.stringify([]));
        }
    }}
>
    🔁 Reset Progress (Testing Only)
</button>
*/}
                        </div>
                    ) : (
<div>
{nextDoseMs === null ? (
  <p>⏳ {t('nextDoseNotSet')}</p>
) : nextDoseMs < Date.now() ? (
<p>⏰ {t('overdue', Math.max(0, Math.floor((Date.now() - nextDoseMs) / 60000)))}</p>
) : (
<p>⏳ {t('nextDoseIn', timeRemaining)}</p>
)}

  <button
    className="cancel-button small"
    onClick={async () => {
      const token = await requestPermissionAndGetToken();

      if (!token) {
        alert("❌ Could not get push token. Nothing was cancelled.");
        return;
      }

      try {
        const res = await fetch("/api/cancelReminders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });

        if (!res.ok) {
          const txt = await res.text().catch(() => "");
          console.error("Cancel-all HTTP error:", res.status, txt);
          alert("❌ Server error while cancelling reminders");
          return;
        }

        localStorage.removeItem("activeReminder");
        localStorage.removeItem("doseSchedule");
        localStorage.removeItem("takenTimestamps");
        localStorage.removeItem("medsTaken");

        setShowReminderForm(false);
        setReminderDrug("");
        setIsLongTerm(false);
        setDurationDays(7);
        setTimesPerDay(1);
        setDailyTimes([""]);
        setMedsTaken(0);
        setTakenTimestamps([]);
        setIsCourseComplete(false);
        setNextDoseTime(null);
        setTimeRemaining("");

        alert("🗑️ All reminders cancelled");
      } catch (err) {
        console.error("❌ Error cancelling reminders:", err);
        alert("❌ Failed to cancel reminders");
      }
    }}
  >
    🗑️ {t('cancelReminders')}
  </button>
</div>

                    )}
                </div>
               
                
                {isCourseComplete && (
                    <div className="progress-section">
                        <h3>🎉 {t('greatJob')}</h3>
                        <p>{t('completedAll')}</p>
                    </div>
                )}
                  </div>
                )}

                {activeTab === 'voice' && (
                <div className="card voice-card">
                    <h3>🎙️ {t('voiceAssistant')}</h3>

                    <div className="mic-row">
<button
  className="mic-button"
  onClick={() => {
    if (window.recognition) {
      window.recognition.start();
    } else {
      alert("🎤 Voice recognition not supported in this browser.");
    }
  }}
  aria-label="Start listening"
  aria-busy={(isListening || loading) ? 'true' : 'false'}
  disabled={isListening || loading}                        // ⛔ prevent re-triggers
>
  🔊🎤 {isListening ? t('listening') : (loading ? t('thinking') : t('tapToAsk'))}
</button>

             <button
  className="mic-button stop"
  onClick={() => {
    try { window.recognition?.stop(); } catch {}
    try { window.speechSynthesis?.cancel(); } catch {}
    try { chatAbortRef.current?.abort(); } catch {}        // ⬅️ stop answer stream
    stopThinkingBeep();                                    // ⬅️ stop the beep now
  }}
  aria-label="Stop listening"
>
  ⛔ {t('stop')}
</button>      
                    </div>
                </div>
                )}

                {activeTab === 'learn' && (
                <div className="card learn-card">
                    <LearnCard
                    hasReminder={hasReminder}
                    reminderDrug={reminderDrug}
                    setActiveTab={setActiveTab}
                    />
                </div>
                )}


                {activeTab === 'earn' && <EarnCard />}

 {activeTab === 'support' && (
  <div className="card support-card">
    <h3>🤝 Support</h3>

    {/* Invite + manage your own Cheer Squad */}
    <CheerSquad />

    {/* Master–detail list of people you're cheering */}
    <CheeringHub />
  </div>
)}

 </div> {/* closes swipe-wrapper */}
        </div> {/* closes card-viewport */}
        {/* === Footer: modal links === */}

<footer className="app-footer">
  <button
    type="button"                                 // 👈 prevent implicit submit
    className="footer-btn"
    onClick={() => openModalAndSetHash('instructions')}
    aria-label="How to use Pill-AI"
    title="How to use Pill-AI"
  >
    📖 {t('howto')}
  </button>

  <button
    type="button"                                 // 👈 prevent implicit submit
    className="footer-btn"
    onClick={() => openModalAndSetHash('privacy')}
    aria-label="Privacy policy"
    title="Privacy policy"
  >
    🛡️ {t('privacy')}
  </button>

  <button
    type="button"                                 // 👈 prevent implicit submit
    className="footer-btn"
    onClick={() => openModalAndSetHash('faq')}
    aria-label="Frequently Asked Questions"
    title="Frequently Asked Questions"
  >
    ❓ {t('faq')}
  </button>
</footer>

{/* === Modals === */}
<HowToPillAI
  isOpen={openModal === 'instructions'}
  onClose={() => closeModalAndClearHash()}
  language={language}
/>

<PrivacyPolicy
  isOpen={openModal === 'privacy'}
  onClose={() => closeModalAndClearHash()}
  language={language}
/>

<FAQ
  isOpen={openModal === 'faq'}
  onClose={() => closeModalAndClearHash()}
  language={language}
/>

      </div> {/* closes app-container */}
    </div>
    );
  }
export default App;
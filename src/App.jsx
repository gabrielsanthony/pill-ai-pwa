import EarnCard from './EarnCard.jsx';
import React, { useState, useEffect, useRef } from 'react';
import './App.css';
import logo from './assets/pill-ai-logo.png'; // ✅ Updated image import
import { requestPermissionAndGetToken } from './firebase-notifications';
import { useSwipeable } from 'react-swipeable';
import LearnCard from './LearnCard';
import { NUDGE_MS, buildNudgeTitle, buildNudgeBody } from './notifications/nudgeCopy';
import { scheduleReminder, cancelReminder } from './notifications/api';
import { getMessaging, onMessage } from 'firebase/messaging';


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
    const [language, setLanguage] = useState('English');
    const [question, setQuestion] = useState('');
    const [simplify, setSimplify] = useState(false);
    const [memory, setMemory] = useState(false);
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
    const [activeTab, setActiveTab] = useState('ask'); // Options: ask, track, voice, about

    const [slideDir, setSlideDir] = useState('right'); // 'left' or 'right'

    // 🔔 In‑app toast state
    const [toast, setToast] = useState(null);           // { title, body } or null
    const [toastVisible, setToastVisible] = useState(false);
    const toastTimerRef = useRef(null);

    // Helper to show a toast for a few seconds
    const TOAST_HIDE_MS = 6000;
    function showToast(title, body) {
    setToast({ title, body });
    setToastVisible(true);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToastVisible(false), TOAST_HIDE_MS);
    }

    // Foreground FCM → show in-app toast
useEffect(() => {
  let unsub;
  try {
    const messaging = getMessaging();
    unsub = onMessage(messaging, (payload) => {
      // Prefer data payload; fall back to notification
      const title = payload?.data?.title || payload?.notification?.title || 'Pill‑AI Reminder';
      const body  = payload?.data?.body  || payload?.notification?.body  || '';

      if (document.visibilityState === 'visible') {
        showToast(title, body);
      }
    });
  } catch (e) {
    console.warn('[PILL‑AI] onMessage unavailable:', e);
  }
  return () => unsub && unsub();
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


    const tabOrder = ['ask', 'track', 'voice', 'learn', 'earn', 'about'];
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

      // Mark this dose as alerted so we don't duplicate
      overdueMap[mainISO] = true;
    } catch (err) {
      console.error('❌ Failed to schedule overdue notification for', mainISO, err);
    }
  }
  setOverdueMap(overdueMap);
}

    function handleVoiceQuery(transcript) {
        console.log("🤖 Handling voice input:", transcript);
        setQuestion(transcript); // Show what was said in the input box

        const payload = {
            question: transcript,
            language,
            simplify,
            memory,
        };

        fetch("/api/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        })
            .then((res) => res.json())
            .then((data) => {
                setAnswer(data.answer);
                speakAnswer(data.answer);
            })
            .catch((err) => {
                console.error("❌ Error processing voice input:", err);
                alert("There was a problem getting the AI answer.");
            });
    }

    function speakAnswer(text) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = "en-US";
        speechSynthesis.speak(utterance);
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
  if (answer) {
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
}, [answer]);

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

        // 📡 Messages forwarded from the Service Worker (push → postMessage)
    useEffect(() => {
    const onSwMessage = (evt) => {
        if (evt?.data?.type === 'REMINDER') {
        const p = evt.data.payload || {};
        const title = p.title || 'Reminder';
        const body  = p.body  || '';
        if (document.visibilityState === 'visible') {
            showToast(title, body);
        }
        }
    };
    if (navigator.serviceWorker?.addEventListener) {
        navigator.serviceWorker.addEventListener('message', onSwMessage);
    }
    return () => {
        if (navigator.serviceWorker?.removeEventListener) {
        navigator.serviceWorker.removeEventListener('message', onSwMessage);
        }
    };
    }, []);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (!SpeechRecognition) {
            console.warn("🛑 Speech Recognition not supported in this browser");
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = "en-US";
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setIsListening(true);
            console.log("🎙️ Listening...");
        };

        recognition.onend = () => {
            setIsListening(false);
            console.log("🛑 Stopped listening");
        };

        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            console.log("🗣️ You said:", transcript);
            handleVoiceQuery(transcript);
        };

        // Store in window for global access
        window.recognition = recognition;
    }, []);

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

    const content = {
        English: {
            privacy: "Pill-AI does not collect or store any personal data. All interactions are processed anonymously. Please consult a healthcare professional for any medical concerns.",
            faq: [
                { q: 'Can I trust Pill-AI?', a: 'Pill-AI uses official NZ medicine data but is only a prototype.' },
                { q: 'Does it store my data?', a: 'No, it processes your questions anonymously.' },
                { q: 'Is it suitable for emergencies?', a: 'No. Always consult a pharmacist or doctor for urgent concerns.' }
            ]
        },
        'Te Reo Māori': {
            privacy: "Kāore a Pill-AI e kohikohi, e pupuri rānei i ngā raraunga whaiaro. Ka mahia ā-tūmataiti ngā pātai katoa. Tēnā tirohia tētahi rata mō ngā āwangawanga hauora.",
            faq: [
                { q: 'Ka taea e au te whakawhirinaki ki a Pill-AI?', a: 'He raraunga rongoā whaimana nō Aotearoa e whakamahia ana, engari he tauira anake tēnei.' },
                { q: 'Ka penapena raraunga taku?', a: 'Kāo. Ka whakahaeretia ā-tūmataiti ngā pātai.' },
                { q: 'He pai mō ngā take ohorere?', a: 'Kāo. Me whakapā tonu ki te rata, ki te kaiwhakarato rongoā rānei.' }
            ]
        },
        Samoan: {
            privacy: "E le aoina pe teu e Pill-AI ni faamatalaga patino. E faagasolo uma fesili i se auala e le mafai ona iloa ai se tagata. Faamolemole fesili i se foma’i pe afai e iai ni ou popolega tau le soifua maloloina.",
            faq: [
                { q: 'E mafai ona ou faatuatuaina le Pill-AI?', a: 'O lo’o fa’aaoga ai faamatalaga aloa’ia i Niu Sila ae o se fa’ata’ita’iga lea.' },
                { q: 'E teu ai a’u faamatalaga?', a: 'Leai. E faagasolo i se auala e le mafai ona iloa ai.' },
                { q: 'E mafai ona fa’aaoga i tulaga fa’afuase’i?', a: 'Leai. Faamolemole fesili i se foma’i pe lo’o tauave rongoā.' }
            ]
        },
        Mandarin: {
            privacy: "Pill-AI 不会收集或存储任何个人数据。所有互动都是匿名处理的。如有健康问题，请咨询医生或药剂师",
            faq: [
                { q: '我可以信任 Pill-AI 吗？', a: 'Pill-AI 使用的是新西兰官方药品信息，但目前仅是一个原型。' },
                { q: '它会存储我的数据吗？', a: '不会，所有问题都是匿名处理的。' },
                { q: '适用于紧急情况吗？', a: '不适用。如遇紧急情况，请立即联系医生或药剂师。' }
            ]
        }
    };

    const TrackCard = () => (
        <div className="progress-section">
            <h3>📈 Track Your Medication</h3>

            {!showReminderForm && (
                <button
                    className="send-button"
                    onClick={() => {
                        setReminderDrug('');
                        setIsLongTerm(false);
                        setDurationDays(7);
                        setTimesPerDay(1);
                        setDailyTimes(['']);
                        setShowReminderForm(true);
                    }}
                    style={{ marginBottom: '10px' }}
                >
                    ➕ Set Med Reminder
                </button>
            )}

            {hasReminder && !isCourseComplete && (
                <>
                    <progress max="100" value={(medsTaken / (durationDays * timesPerDay)) * 100}></progress>
                    <p>{Math.floor((medsTaken / (durationDays * timesPerDay)) * 100)}% of your meds journey completed</p>
                </>
            )}

            {isDoseWindowOpen() ? (
                <div>
                    <button
                        className="send-button"
                        onClick={handleMedsTaken}
                    >
                        ✅ Meds Taken
                    </button>
                    <button
                        className="cancel-button"
                        onClick={resetProgress}
                    >
                        🔁 Reset Progress (Testing Only)
                    </button>
                </div>
            ) : (
                <div>
                    <p>⏳ Next dose in: <strong>{timeRemaining}</strong></p>
                    <button
                        className="cancel-button small"
                        onClick={cancelAllReminders}
                    >
                        🗑️ Cancel Reminders
                    </button>
                </div>
            )}
        </div>
    );


const nextDoseMs = nextDoseTime
  ? (nextDoseTime instanceof Date ? nextDoseTime.getTime() : new Date(nextDoseTime).getTime())
  : null;

    return (
        <div className="main-wrapper">
            <div className="app-container">
                <header className="header">
                    <img src={logo} alt="Pill-AI Logo" className="logo" />
                    <div className="language-selector">
                        <label htmlFor="language" style={{ fontWeight: "bold", display: "block", marginBottom: "4px" }}>
                            🌐 Language:
                        </label>
                        <select id="language" value={language} onChange={(e) => setLanguage(e.target.value)}>
                            <option value="English">English</option>
                            <option value="Te Reo Māori">Te Reo Māori</option>
                            <option value="Samoan">Samoan</option>
                            <option value="Mandarin">Mandarin</option>
                        </select>
                    </div>
                </header>

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

                <div className="tab-bar">
                     <button className={activeTab === 'ask' ? 'tab active' : 'tab'} onClick={() => goToTab('ask')}>💬 Chat</button>
                        <button className={activeTab === 'track' ? 'tab active' : 'tab'} onClick={() => goToTab('track')}>💊 Track</button>
                        <button className={activeTab === 'voice' ? 'tab active' : 'tab'} onClick={() => goToTab('voice')}>🎙️ Voice</button>
                        <button className={activeTab === 'learn' ? 'tab active' : 'tab'} onClick={() => goToTab('learn')}>📘 Learn</button>
                        <button className={activeTab === 'earn' ? 'tab active' : 'tab'} onClick={() => goToTab('earn')}>🏆 Earn</button>
                        <button className={activeTab === 'about' ? 'tab active' : 'tab'} onClick={() => goToTab('about')}>ℹ️ About</button>
                </div>
            
            <div className="card-viewport">
            <div {...handlers} className={`swipe-wrapper slide-${slideDir}`} key={activeTab}>
                {/* keep ALL your existing tab conditionals here */}
            {activeTab === 'ask' && (
                <form
                    className="card ask-card"
                    onSubmit={async (e) => {
                        e.preventDefault(); // ⛔ Prevent page reload on Enter

                        const payload = {
                            question,
                            language,
                            simplify,
                            memory,
                        };

                        try {
                            const response = await fetch("/api/chat", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify(payload),
                            });

                            const result = await response.json();
                            setAnswer(result.answer);
                            setShowReminderForm(false); // Reset in case they ask a new question
                        } catch (err) {
                            console.error(err);
                            alert("❌ Error fetching response");
                        }
                    }}
                >
                    <h2 className="card-title">💬 Medicines Chat</h2>

                    <div className="form-group">
                        <input
                            type="text"
                            className="question-input"
                            placeholder="💡 Ask a medication related question"
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                        />
                    </div>

                    <button className="send-button" type="submit">
                        Send
                    </button>

                    {/* ✅ Always visible – these are OUTSIDE the reminder form */}
                    <div className="toggles">
                        <label>
                            <input
                                type="checkbox"
                                checked={simplify}
                                onChange={() => setSimplify(!simplify)}
                            />
                            ✨ Simplify the answer's language
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                checked={memory}
                                onChange={() => setMemory(!memory)}
                            />
                            🧠 Memorise previous answers for context in follow-up questions
                        </label>
                    </div>

                    {answer && (
                        <div>
                            <div className="answer-box">
                                <strong>💬 Answer:</strong>
                                <p>{answer}</p>
                            </div>
                        </div>
                    )}
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
                <div className="progress-section">
                    <h3>📈 Track Your Medication</h3>

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
                            ➕ Set Med Reminder
                        </button>
                    )}

                    {hasReminder && !isCourseComplete && (
                        <>
                            <progress max="100" value={(medsTaken / (durationDays * timesPerDay)) * 100}></progress>
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
                                ✅ Meds Taken
                            </button>

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
                        </div>
                    ) : (
<div>
  {nextDoseMs === null ? (
    <p>⏳ Next dose: <strong>not set</strong></p>
  ) : nextDoseMs < Date.now() ? (
    <p>⏰ Overdue: <strong>{Math.max(0, Math.floor((Date.now() - nextDoseMs) / 60000))} min ago</strong></p>
  ) : (
    <p>⏳ Next dose in: <strong>{timeRemaining}</strong></p>
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
    🗑️ Cancel Reminders
  </button>
</div>

                    )}
                </div>

                {isCourseComplete && (
                    <div className="progress-section">
                        <h3>🎉 Great job!</h3>
                        <p>You've completed all your scheduled doses. Keep up the good work!</p>
                    </div>
                )}
                  </div>
                )}

                {activeTab === 'voice' && (
                <div className="card voice-card">
                    <h3>🎙️ Voice Assistant</h3>

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
                    >
                        🔊🎤 {isListening ? "Listening..." : "Tap to Ask"}
                    </button>

                    <button
                        className="mic-button stop"
                        onClick={() => {
                        try { window.recognition?.stop(); } catch {}
                        try { window.speechSynthesis?.cancel(); } catch {}
                        }}
                        aria-label="Stop listening"
                    >
                        ⛔ Stop
                    </button>
                    </div>
                </div>
                )}

                {activeTab === 'earn' && <EarnCard />}

                {activeTab === 'about' && (
                <div className="card about-card">
                    <h3>ℹ️ About Pill-AI</h3>
                    <details>
                        <summary>🧪 Instructions – Click to expand</summary>
                        <ol>
                            <li>💬 Type a medicine-related question in the box at the top of the page.</li>
                            <li>💡 Press <strong>Enter</strong> or click <strong>Send</strong> to get an answer from Pill-AI.</li>
                            <li>🌐 To change the app’s language, use the <strong>Language</strong> dropdown in the top-right corner.</li>
                            <li>⏰ If the answer includes medicine info, click <strong>➕ Set Med Reminder</strong> to schedule reminders.</li>
                            <li>📅 Choose how many times a day you take your medicine, and for how many days. Then click <strong>Save Reminder</strong>.</li>
                            <li>🔔 Pill-AI will notify you when it’s time to take your medication.</li>
                            <li>✅ When you take your dose, click the <strong>Meds Taken</strong> button. You’ll only see it when a dose is due (within 30 mins).</li>
                            <li>📈 Watch your progress bar increase as you stay on track!</li>
                            <li>🔁 You can reset or cancel reminders at any time using the red buttons below the tracker.</li>
                        </ol>
                    </details>

                    <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid #ddd" }} />

                    <details>
                        <summary>🔒 Privacy Policy – Click to expand</summary>
                        <p>{content[language]?.privacy || content["English"].privacy}</p>
                    </details>

                    <hr style={{ margin: "1.5rem 0", border: "none", borderTop: "1px solid #ddd" }} />

                    <details>
                        <summary>❓ FAQ – Click to expand</summary>
                        <ul>
                            {content[language].faq.map((item, idx) => (
                                <li key={idx}>
                                    <strong>Q:</strong> {item.q}
                                    <br />
                                    <strong>A:</strong> {item.a}
                                </li>
                            ))}
                        </ul>
                    </details>
                </div>
                )}
                </div>

            </div> {/* closes app-container */}
        </div>
        </div>
    );
}
export default App;
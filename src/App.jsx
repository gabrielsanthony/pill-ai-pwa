import EarnCard from './EarnCard.jsx';
import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/pill-ai-logo.png'; // ✅ Updated image import
import { requestPermissionAndGetToken } from './firebase-notifications';
import { onMessage, getMessaging } from 'firebase/messaging'; // already there
import Fuse from 'fuse.js';
import { medicineNames } from './medicineList';
import { useSwipeable } from 'react-swipeable';
import LearnCard from './LearnCard';
import { NUDGE_MS, buildNudgeTitle, buildNudgeBody } from './notifications/nudgeCopy';
import { scheduleReminder, cancelReminder } from './notifications/api';

const getNudgeMap = () => {
  try {
    return JSON.parse(localStorage.getItem('nudgeMap') || '{}');
  } catch {
    return {};
  }
};
const setNudgeMap = (m) => localStorage.setItem('nudgeMap', JSON.stringify(m));

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

    const goToTab = (newTab) => {
    const oldIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);
    setSlideDir(newIndex > oldIndex ? 'right' : 'left');
    setActiveTab(newTab);
    };

    const tabOrder = ['ask', 'track', 'voice', 'learn', 'earn', 'about'];
    const handlers = useSwipeable({
    onSwipedLeft: () => {
        const i = tabOrder.indexOf(activeTab);
        if (i < tabOrder.length - 1) goToTab(tabOrder[i + 1]);
    },
    onSwipedRight: () => {
        const i = tabOrder.indexOf(activeTab);
        if (i > 0) goToTab(tabOrder[i - 1]);
    },
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

    // ✅ Only allow Meds Taken button if within 30 min of next dose
    function isDoseWindowOpen() {
        if (!nextDoseTime) return false;
        const now = new Date().getTime();
        const dose = new Date(nextDoseTime).getTime();
        const diffMins = Math.abs((dose - now) / 1000 / 60);

        // Only allow within 30 minutes and if not already taken
        return diffMins <= 30 && !takenTimestamps.includes(nextDoseTime.toISOString());
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

    useEffect(() => {
        if (!nextDoseTime) return;
        const interval = setInterval(() => {
            const now = new Date();
            const diff = nextDoseTime - now;

            if (diff <= 0) {
                setTimeRemaining('');
                clearInterval(interval);
            } else {
                const mins = Math.floor((diff / 1000 / 60) % 60);
                const hrs = Math.floor((diff / 1000 / 60 / 60));
                setTimeRemaining(`${hrs}h ${mins}m remaining`);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, [nextDoseTime]);

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


    // ⬇️ ADD THIS BELOW your first useEffect block
    useEffect(() => {
        if (answer) {
            const name = extractMedicineName(answer);
            const duration = extractDuration(answer);
            if (name) setReminderDrug(name);
            if (duration) setDurationDays(duration);
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
                                const mapUpdates = {}; // ✅ NEW: build doseISO -> nudgeISO map

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
    tag: `dose:${mainISO}`
  };
  remindersToSchedule.push(main);
  mainReminders.push(main);

  // NUDGE (dose + NUDGE_MS)
  const nudgeDate = new Date(scheduled.getTime() + NUDGE_MS);
  if (nudgeDate > now) {
    const nudgeISO = nudgeDate.toISOString(); // 👈 capture nudge ISO
    const nudge = {
      token,
      title: buildNudgeTitle(reminderDrug),
      body: buildNudgeBody(reminderDrug),
      sendAt: nudgeISO,
      tag: `nudge:${mainISO}`
    };
    remindersToSchedule.push(nudge);

    // 👇 record the mapping main -> nudge
    mapUpdates[mainISO] = nudgeISO;
  }
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
  console.log("🧠 Stored dose timestamps (main only):", doseTimestamps);

 // ✅ Save the main->nudge mapping to state (your useEffect will sync it to localStorage)
setNudgeMap(prev => ({ ...prev, ...mapUpdates }));

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
                                    } else {
                                        setNextDoseTime(null);
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
                            <p>⏳ Next dose in: <strong>{timeRemaining}</strong></p>
                            <button
                                className="cancel-button small"
                                onClick={async () => {
                                    const token = await requestPermissionAndGetToken();

                                    if (!token) {
                                        alert("❌ Could not get push token. Nothing was cancelled.");
                                        return;
                                    }

                                    try {
                                        const res = await fetch("/api/cancelReminder", {
                                            method: "POST",
                                            headers: { "Content-Type": "application/json" },
                                            body: JSON.stringify({ token }),
                                        });

                                        const result = await res.json();
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
                    <button
                        className="mic-button"
                        onClick={() => {
                            if (window.recognition) {
                                window.recognition.start();
                            } else {
                                alert("🎤 Voice recognition not supported in this browser.");
                            }
                        }}
                    >
                        🔊🎤 {isListening ? "Listening..." : "Tap to Ask"}
                    </button>
                </div>
                )}

                {activeTab === 'learn' && (
                <LearnCard
                    hasReminder={hasReminder}
                    reminderDrug={reminderDrug}
                    setActiveTab={setActiveTab}
                />
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
import React, { useState, useEffect } from 'react';
import './App.css';
import logo from './assets/pill-ai-logo.png'; // ✅ Updated image import
import { requestPermissionAndGetToken } from './firebase-notifications';
import { onMessage, getMessaging } from 'firebase/messaging'; // already there
import Fuse from 'fuse.js';
import { medicineNames } from './medicineList';

const fuse = new Fuse(medicineNames, {
  includeScore: true,
  threshold: 0.3, // how fuzzy (lower = stricter)
});

function extractMedicineName(text) {
  const results = fuse.search(text);
  return results.length ? results[0].item : '';
}

// 📅 Extract "for X days"
function extractDuration(text) {
  const match = text.match(/for (\d+) days?/i);
  return match ? parseInt(match[1]) : null;
}

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

  // ✅ Only allow Meds Taken button if within 30 min of next dose
  function isDoseWindowOpen() {
    if (!nextDoseTime) return false;
    const now = new Date().getTime();
    const dose = new Date(nextDoseTime).getTime();
    const diffMins = Math.abs((dose - now) / 1000 / 60);

    // Only allow within 30 minutes and if not already taken
    return diffMins <= 30 && !takenTimestamps.includes(nextDoseTime.toISOString());
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

      <div className="question-card">
  <div className="form-group">
    <input
      type="text"
      className="question-input"
      placeholder="💡 Ask a medication related question"
      value={question}
      onChange={(e) => setQuestion(e.target.value)}
    />
  </div>

      <button
        className="send-button"
        onClick={async () => {
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
        Send
      </button>
      {answer && (
        <div>
          <div className="answer-box">
            <strong>💬 Answer:</strong>
            <p>{answer}</p>
          </div>

          {!showReminderForm && (
            <button
              className="send-button"
              onClick={() => setShowReminderForm(true)}
            >
              ➕ Set a Reminder
            </button>
          )}
        </div>
      )}
      </div>


      

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

              console.log("🧠 Saved to localStorage:", reminderInfo);

              // 🧹 Reset medsTaken progress
              setMedsTaken(0);
              setIsCourseComplete(false); // 🔄 Reset progress bar visibility for new reminder
              localStorage.removeItem("medsTaken");

              const token = await requestPermissionAndGetToken();

              if (!token) {
                alert("❌ Could not get push token. Reminder not saved.");
                return;
              }

              const remindersToSchedule = [];
              const now = new Date();
              const daysToSchedule = isLongTerm ? 30 : durationDays;

              try {
                for (let dayOffset = 0; dayOffset < daysToSchedule; dayOffset++) {
                  for (const time of dailyTimes) {
                    if (!time) continue;
                    const [hour, minute] = time.split(":").map(Number);
                    const scheduled = new Date(now);
                    scheduled.setDate(scheduled.getDate() + dayOffset);
                    scheduled.setHours(hour, minute, 0, 0);

                    if (scheduled > now) {
                      remindersToSchedule.push({
                        token,
                        title: `🕒 Pill Reminder: ${reminderDrug}`,
                        body: `Take ${reminderDrug} at ${time}`,
                        sendAt: scheduled.toISOString(),
                      });
                    }
                  }
                }

                for (const reminder of remindersToSchedule) {
                  try {
                    const response = await fetch("/api/scheduleReminder", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(reminder),
                    });

                    const result = await response.json();
                    console.log("✅ Reminder saved:", result);
                  } catch (err) {
                    console.error("❌ Failed to save reminder:", err);
                  }
                }

                // ✅ Save dose timestamps locally for button logic
                const doseTimestamps = remindersToSchedule.map(r => r.sendAt);
                localStorage.setItem("doseSchedule", JSON.stringify(doseTimestamps));
                console.log("🧠 Stored dose timestamps:", doseTimestamps);

                alert(`✅ ${remindersToSchedule.length} reminders scheduled for ${reminderDrug}`);
              } catch (err) {
                console.error("❌ Reminder scheduling error:", err);
                alert("❌ Error while saving reminder");
              }
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
      {reminderDrug && durationDays > 0 && !isLongTerm && !isCourseComplete && (
        <div className="progress-section">
          <h3>📈 Track Your Medication</h3>
          <progress max="100" value={(medsTaken / (durationDays * timesPerDay)) * 100}></progress>
          <p>{Math.floor((medsTaken / (durationDays * timesPerDay)) * 100)}% of your meds journey completed</p>

          {isDoseWindowOpen() ? (
            <div>
              <button
                className="send-button"
                onClick={async () => {
                  if (isCourseComplete || !nextDoseTime) return;

                  const token = await requestPermissionAndGetToken();

                  // 📵 Cancel the related push notification
                  try {
                    await fetch('/api/cancelSingleReminder', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        token,
                        timestamp: nextDoseTime.toISOString(),
                      }),
                    });
                  } catch (err) {
                    console.error("❌ Failed to cancel push notification:", err);
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
      )}

      {isCourseComplete && (
        <div className="progress-section">
          <h3>🎉 Great job!</h3>
          <p>You've completed all your scheduled doses. Keep up the good work!</p>
        </div>
      )}


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
      <details className="info-section">
        <summary>🔒 Privacy Policy – Click to expand</summary>
        <p>{content[language]?.privacy || content["English"].privacy}</p>
      </details>

      <details className="info-section">
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
    </div> {/* closes app-container */}
  </div>
);
}
export default App;
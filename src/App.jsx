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

  const [isLongTerm, setIsLongTerm] = useState(false);
  const [durationDays, setDurationDays] = useState(7); // Default 7 days
  const [reminderDrug, setReminderDrug] = useState('');
  const [reminderTime, setReminderTime] = useState('');

  const [showReminderForm, setShowReminderForm] = useState(false);
  const [timesPerDay, setTimesPerDay] = useState(1);
  const [dailyTimes, setDailyTimes] = useState(['']);

  // 🧠 Restore reminder info from localStorage on load
useEffect(() => {
  const stored = localStorage.getItem("activeReminder");
  if (stored) {
    const { medicine, days, timesPerDay } = JSON.parse(stored);
    console.log("🔄 Restoring reminder from localStorage:", { medicine, days, timesPerDay });
    setReminderDrug(medicine);
    setDurationDays(days);
    setTimesPerDay(timesPerDay);
    setDailyTimes(Array(timesPerDay).fill(''));
  }
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
    <>
    <div className="app-container">
      <header className="header">
        <img
          src={logo} // ✅ Use imported image path
          alt="Pill-AI Logo"
          className="logo"
          width="100"
        />
        <h1>PILL-AI</h1>
        <p className="tagline">Your Trusted Medicines Advisor</p>
      </header>
      <div className="form-group">
        <label htmlFor="language">🌐 Choose answer language:</label>
        <select
          id="language"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option>English</option>
          <option>Te Reo Māori</option>
          <option>Samoan</option>
          <option>Mandarin</option>
        </select>
      </div>
      <div className="form-group">
        <input
          type="text"
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

<button
  className="cancel-button"
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

      const result = await res.json();
      alert("🗑️ All reminders cancelled");
    } catch (err) {
      console.error("❌ Error cancelling reminders:", err);
      alert("❌ Failed to cancel reminders");
    }
  }}
>
  🗑️ Cancel All Reminders
</button>

    {answer && (
  <>
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
  </>
)}

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
localStorage.setItem("activeReminder", JSON.stringify(reminderInfo));
console.log("🧠 Saved to localStorage:", reminderInfo);

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
 </div>
  </>
);
}

export default App;
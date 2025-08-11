import React, { useEffect, useState, useRef } from 'react';
import { getXP, calculateLevel, subscribe } from './utils/xp.js';
import { recordEvent } from './gamification/actions.js';

function LearnCard({ hasReminder, reminderDrug, setActiveTab }) {
        const [quiz, setQuiz] = useState(null);
        const [selected, setSelected] = useState(null);
        const [feedback, setFeedback] = useState('');

        const [xp, setXp] = useState(() => getXP());
        const [level, setLevel] = useState(() => calculateLevel(getXP()));
        const [loading, setLoading] = useState(false); // NEW
        const slowTimer = useRef(null); // ⏱️ local “still working…” timer



        // Load quiz on reminder change

        // Load quiz on reminder change (normalize correct answer + abort stale fetches)
        // Trigger load when reminder/medicine changes
        useEffect(() => {
                if (!hasReminder || !reminderDrug) return;
                const ac = new AbortController();
                loadQuiz(ac.signal);
                return () => ac.abort();
        }, [hasReminder, reminderDrug]);


async function loadQuiz(signal) {
  if (!hasReminder || !reminderDrug) return;

  try {
    setLoading(true);
    setQuiz(null);
    setSelected(null);
    setFeedback('');

    // Clear any existing timer before starting a new one
    if (slowTimer.current) {
      clearTimeout(slowTimer.current);
      slowTimer.current = null;
    }
    // Show a gentle hint if fetch takes >3s
    slowTimer.current = setTimeout(() => {
      setFeedback('⏳ Still working… this can take a few seconds.');
    }, 3000);

    const res = await fetch('/api/generateQuestion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medicine: reminderDrug }),
      signal,
    });
    const data = await res.json();

    // --- normalize to numeric correctIndex (0..3) ---
    let correctIndex = null;

    if (typeof data.answer === 'string') {
      const map = { A: 0, B: 1, C: 2, D: 3 };
      correctIndex = map[data.answer.trim().toUpperCase()];
    } else if (typeof data.answer === 'number') {
      correctIndex = data.answer;
    }
    if (correctIndex == null && Array.isArray(data.choices) && data.answer) {
      const strip = s => String(s).replace(/^[A-D]:\s*/i, '').trim();
      const ans = strip(data.answer);
      correctIndex = data.choices.findIndex(c => strip(c) === ans);
    }

    if (data.question && Array.isArray(data.choices) && correctIndex != null) {
      setQuiz({ ...data, correctIndex });
    } else {
      console.warn('⚠️ Incomplete quiz data:', data);
      setFeedback('⚠️ Sorry, that question failed. Tap “Next Question” to try again.');
    }
  } catch (err) {
    if (err.name !== 'AbortError') {
      console.error('❌ Failed to load quiz:', err);
      setFeedback('❌ Network error. Tap “Next Question” to try again.');
    }
  } finally {
    // clear the slow timer no matter what
    if (slowTimer.current) {
      clearTimeout(slowTimer.current);
      slowTimer.current = null;
    }
    setLoading(false);
  }
}

        useEffect(() => {
                const unsub = subscribe((newXP) => {
                        setXp(newXP);
                        setLevel(calculateLevel(newXP));
                });
                return unsub; // cleanup on unmount
        }, []);

        useEffect(() => {
                return () => {
                if (slowTimer.current) {
                clearTimeout(slowTimer.current);
                slowTimer.current = null;
                }
                };
                }, []);

        function handleChoice(selectedIndex) {
                setSelected(selectedIndex);

                if (selectedIndex === quiz.correctIndex) {
                        setFeedback('✅ Correct!');
                        const res = recordEvent('quiz_correct'); // { awardedXP, newXP, skipped, skipReason }
                        if (!res.skipped && typeof res.newXP === 'number') {
                                setXp(res.newXP);
                                setLevel(calculateLevel(res.newXP));
                        }
                } else {
                        const letter = 'ABCD'[quiz.correctIndex] ?? '?';
                        const text = quiz.choices[quiz.correctIndex];
                        setFeedback(`❌ Incorrect. The correct answer was: ${letter}: ${text}`);
                }
        }

        return (
                <div className="card learn-card">
                        <h3>📘 Learn About Your Medication</h3>

                        {!hasReminder ? (
                                <>
                                        <p>📌 You don’t have any medication reminders set yet.</p>
                                        <p>Please set a reminder to unlock your daily Learn card.</p>
                                        <button className="send-button" onClick={() => setActiveTab('track')}>
                                                ➕ Set Medication Reminder
                                        </button>
                                </>
                        ) : quiz ? (
                                <>
                                        <p><strong>🎖 Level:</strong> {level} | <strong>XP:</strong> {xp}</p>
                                        <progress value={xp % 100} max="100" style={{ width: '100%', marginBottom: '1rem' }} />

                                        <p><strong>💊 Medicine:</strong> {reminderDrug}</p>
                                        <p style={{ marginTop: '1rem' }}><strong>🧠 Quiz:</strong> {quiz.question}</p>
                                        <ul style={{ listStyle: 'none', paddingLeft: 0 }}>

                                                {quiz.choices.map((choice, idx) => (
                                                        <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                                                <button
                                                                        className="choice-button"
                                                                        onClick={() => handleChoice(idx)}
                                                                        disabled={selected !== null || loading}
                                                                        style={{
                                                                                width: '100%',
                                                                                padding: '10px',
                                                                                backgroundColor:
                                                                                        selected === null
                                                                                                ? '#f0f0f0'
                                                                                                : (idx === quiz.correctIndex
                                                                                                        ? '#d4edda' // correct answer
                                                                                                        : (idx === selected ? '#f8d7da' : '#f0f0f0')),
                                                                                border: '1px solid #ccc',
                                                                                borderRadius: '5px',
                                                                                cursor: selected !== null ? 'default' : 'pointer',
                                                                        }}
                                                                >
                                                                        {choice}
                                                                </button>
                                                        </li>
                                                ))}

                                        </ul>
                                        {feedback && <p><strong>{feedback}</strong></p>}
                                        {selected !== null && (
                                                <button
                                                        className="send-button"
                                                        onClick={() => {
                                                                const ac = new AbortController();
                                                                loadQuiz(ac.signal);
                                                        }}
                                                        disabled={loading}
                                                >
                                                        {loading ? '⏳ Loading…' : '🔄 Next Question'}
                                                </button>
                                        )}

                                </>
                        ) : (
                                <div style={{ opacity: 0.95 }}>
                                        <p style={{ marginBottom: '0.75rem' }}>
                                                {loading ? '⏳ Generating a new question…' : 'Preparing your next question…'}
                                        </p>
                                        {!loading && (
                                                <button
                                                        className="send-button"
                                                        onClick={() => {
                                                                const ac = new AbortController();
                                                                loadQuiz(ac.signal);
                                                        }}
                                                >
                                                        🔁 Retry
                                                </button>
                                        )}
                                </div>
                        )
                        }
                </div>
        );
}

export default LearnCard;
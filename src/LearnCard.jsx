import React, { useEffect, useState } from 'react';

function LearnCard({ hasReminder, reminderDrug, setActiveTab }) {
    const [quiz, setQuiz] = useState(null);
    const [selected, setSelected] = useState(null);
    const [feedback, setFeedback] = useState('');

    useEffect(() => {
        if (!hasReminder || !reminderDrug) return;

        async function fetchQuiz() {
            try {
                const response = await fetch('/api/generateQuestion', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ medicine: reminderDrug }),
                });

                const data = await response.json();
                if (data.question && data.choices && data.answer) {
                    setQuiz(data);
                    setSelected(null);
                    setFeedback('');
                } else {
                    console.warn("⚠️ Incomplete quiz data:", data);
                }
            } catch (err) {
                console.error("❌ Failed to load quiz:", err);
            }
        }

        fetchQuiz();
    }, [hasReminder, reminderDrug]);

    function handleChoice(choice) {
        setSelected(choice);
        if (choice === quiz.answer) {
            setFeedback("✅ Correct!");
        } else {
            setFeedback(`❌ Incorrect. The correct answer was: ${quiz.answer}`);
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
                    <p><strong>💊 Medicine:</strong> {reminderDrug}</p>
                    <p style={{ marginTop: '1rem' }}><strong>🧠 Quiz:</strong> {quiz.question}</p>
                    <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
                        {quiz.choices.map((choice, idx) => (
                            <li key={idx} style={{ marginBottom: '0.5rem' }}>
                                <button
                                    className="choice-button"
                                    onClick={() => handleChoice(choice)}
                                    disabled={!!selected}
                                    style={{
                                        width: '100%',
                                        padding: '10px',
                                        backgroundColor:
                                            selected === choice
                                                ? (choice === quiz.answer ? '#d4edda' : '#f8d7da')
                                                : '#f0f0f0',
                                        border: '1px solid #ccc',
                                        borderRadius: '5px',
                                        cursor: selected ? 'default' : 'pointer',
                                    }}
                                >
                                    {choice}
                                </button>
                            </li>
                        ))}
                    </ul>
                    {feedback && <p><strong>{feedback}</strong></p>}
                    {selected && (
                        <button className="send-button" onClick={() => setQuiz(null)}>
                            🔄 Next Question
                        </button>
                    )}
                </>
            ) : (
                <p>⏳ Generating a new question about <code>{reminderDrug}</code>...</p>
            )}
        </div>
    );
}

export default LearnCard;
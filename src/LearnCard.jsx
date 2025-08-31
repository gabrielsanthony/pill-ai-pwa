// src/LearnCard.jsx
import React, { useEffect, useMemo, useState } from "react";

/* ---------- XP helpers ---------- */
function getXP() {
  return Number(localStorage.getItem("xp") || 0);
}
function addXP(n = 1) {
  const next = getXP() + n;
  localStorage.setItem("xp", String(next));
  // Let EarnCard (or others) live-update if they listen
  window.dispatchEvent(new CustomEvent("xp:updated", { detail: next }));
  return next;
}

/* ---------- Component ---------- */
export function LearnCard({ hasReminder, reminderDrug, setActiveTab }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // one MCQ from /api/generateQuestion
  const [mcq, setMcq] = useState(null);     // { question, choices[], answer }
  const [picked, setPicked] = useState(null); // selected index
  const [checked, setChecked] = useState(false);
  const [wasCorrect, setWasCorrect] = useState(false);

  const friendlyDrug = useMemo(
    () => (reminderDrug ? String(reminderDrug) : "your medicine"),
    [reminderDrug]
  );

  async function fetchOneQuestion() {
    if (!hasReminder) return;

    setLoading(true);
    setError("");
    setMcq(null);
    setPicked(null);
    setChecked(false);
    setWasCorrect(false);

    try {
      const res = await fetch("/api/generateQuestion", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ medicine: reminderDrug || "medicine" }),
      });
      const data = await res.json();
      if (!res.ok || !data?.question || !Array.isArray(data?.choices)) {
        throw new Error(data?.error || "Quiz API failed");
      }
      setMcq(data);
    } catch (e) {
      console.error(e);
      setError(String(e.message || e));
    } finally {
      setLoading(false);
    }
  }

  function checkAnswer() {
    if (!mcq || picked == null) return;
    const correctIndex = mcq.choices.findIndex((c) => c === mcq.answer);
    const isRight = picked === correctIndex;
    setWasCorrect(isRight);
    setChecked(true);
    if (isRight) addXP(1); // ✅ +1 XP per correct
  }

  function nextQuestion() {
    fetchOneQuestion();
  }

  // Auto-load a question whenever a reminder exists and medicine changes
  useEffect(() => {
    if (hasReminder && reminderDrug) {
      fetchOneQuestion();
    }
  }, [hasReminder, reminderDrug]);

  return (
    <div>
      <h3>📘 Learn</h3>

      {hasReminder ? (
        <p>
          You’ve set a reminder for <strong>{friendlyDrug}</strong>. Explore tips—and answer quick
          questions—while you wait for the next dose.
        </p>
      ) : (
        <p>
          No reminder set yet. You can set one from the <strong>💊 Track</strong> tab.
          <br />
          <button className="send-button" onClick={() => setActiveTab?.("track")}>
            ➕ Set a Med Reminder
          </button>
        </p>
      )}

      <ul style={{ marginTop: "1rem" }}>
        <li>Why adherence matters: fewer missed doses, better outcomes.</li>
        <li>Store medicines safely and check expiry dates.</li>
        <li>Ask a pharmacist before mixing medicines or supplements.</li>
      </ul>

      {/* --- MCQ area --- */}
      {hasReminder && !mcq && !loading && !error && (
        <div style={{ marginTop: 16 }}>
          <button className="send-button" onClick={fetchOneQuestion}>
            ▶️ Get a question about {friendlyDrug}
          </button>
        </div>
      )}

      {loading && <p style={{ marginTop: 16 }}>Building a question…</p>}
      {error && <p style={{ color: "crimson" }}>⚠️ {error}</p>}

      {mcq && (
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 700, marginBottom: 6 }}>🧠 Quick Question</div>
          <div style={{ marginBottom: 10 }}>{mcq.question}</div>

          {mcq.choices.map((c, i) => (
            <label key={i} style={{ display: "block", margin: "6px 0" }}>
              <input
                type="radio"
                name="mcq-choice"
                disabled={checked}
                checked={picked === i}
                onChange={() => setPicked(i)}
              />{" "}
                {c}
            </label>
          ))}

          {!checked ? (
            <button
              className="send-button"
              style={{ marginTop: 12 }}
              disabled={picked == null}
              onClick={checkAnswer}
            >
              Check answer
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div
                style={{
                  marginBottom: 10,
                  padding: "6px 8px",
                  borderLeft: wasCorrect ? "3px solid #2e7d32" : "3px solid #c62828",
                  background: "rgba(0,0,0,0.04)",
                }}
              >
                {wasCorrect ? "✅ Correct! +1 XP" : `❌ Not quite. Correct answer: ${mcq.answer}`}
              </div>
              <button className="send-button" onClick={nextQuestion}>
                Next question
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
// src/LearnCard.jsx
import React from 'react';

export function LearnCard({ hasReminder, reminderDrug, setActiveTab }) {
  return (
    <div>
      <h3>📘 Learn</h3>

      {hasReminder ? (
        <p>
          You’ve set a reminder for <strong>{reminderDrug || 'your medicine'}</strong>.
          Explore tips below while you wait for the next dose.
        </p>
      ) : (
        <p>
          No reminder set yet. You can set one from the <strong>💊 Track</strong> tab.
          <br />
          <button className="send-button" onClick={() => setActiveTab?.('track')}>
            ➕ Set a Med Reminder
          </button>
        </p>
      )}

      <ul style={{ marginTop: '1rem' }}>
        <li>Why adherence matters: fewer missed doses, better outcomes.</li>
        <li>Store medicines safely and check expiry dates.</li>
        <li>Ask a pharmacist before mixing medicines or supplements.</li>
      </ul>
    </div>
  );
}
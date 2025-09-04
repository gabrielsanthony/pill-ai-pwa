// src/CheerSquad.jsx
import React, { useState } from "react";
import { createJoinLink, ensureAnonAuth } from './utils/firebase-db';


/* --- helpers --- */
const maskPhone = (e164 = "") =>
  e164.replace(/^(\+\d{2})(\d+)(\d{3})$/, (_, cc, mid, tail) => `${cc}${"•".repeat(Math.max(0, mid.length - 1))}${tail}`);

const isE164 = (s = "") => /^\+\d{6,15}$/.test(s.replace(/\s|-/g, ""));

export default function CheerSquad() {
  // MVP: local state (you can swap to Firestore later)
  const [supporters, setSupporters] = useState([]);
  const [showInviteModal, setShowInviteModal] = useState(false);

  // 🆕 Support feed for incoming cheers/nudges (MVP local state)
const [feed, setFeed] = useState([]); // [{id, supporterName, type, message, ts}]

  // modal form state
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("+64"); // NZ default
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState("");

  const [ownerId] = useState(localStorage.getItem('ownerId') || 'owner_demo_1'); // fallback for now
const [inviteLink, setInviteLink] = useState('');

  const resetForm = () => {
    setName("");
    setPhone("+64");
    setConsent(false);
    setError("");
  };

  async function addSupporter(e) {
    e?.preventDefault?.();
    const trimmedName = name.trim();
    const cleanedPhone = phone.replace(/\s|-/g, "");

    // client-side validation (mirror the API)
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setError("Please enter a name (2–50 characters).");
      return;
    }
    if (!isE164(cleanedPhone)) {
      setError("Enter a valid WhatsApp number in E.164 format (e.g., +64XXXXXXXX).");
      return;
    }
    if (!consent) {
      setError("You must confirm you have permission to invite this person.");
      return;
    }
    if (supporters.some((s) => s.wa_phone === cleanedPhone)) {
      setError("That number is already in your Cheer Squad.");
      return;
    }

    try {
      const r = await fetch("/api/supporters/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: trimmedName, wa_phone: cleanedPhone })
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok || !data?.ok) throw new Error(data?.error || `HTTP ${r.status}`);

      setSupporters((prev) => [...prev, data.supporter]); // add returned supporter
      setShowInviteModal(false);
      resetForm();
      // Optional UX: alert("✅ Invite sent (demo). They’ll appear as Pending.");
    } catch (err) {
      console.error("Invite error:", err);
      setError("Could not send invite. Please try again.");
    }
  }

  function removeSupporter(id) {
    setSupporters((prev) => prev.filter((s) => s.id !== id));
  }

  // 🧪 DEMO helper: simulate an incoming support event and append to feed
async function simulateEvent({
  supporterName = 'Alex',
  type = 'CHEER',
  message = "You've got this.",
  presetKey = 'GOT_THIS'
} = {}) {
  try {
    const r = await fetch('/api/supportEvents/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ supporterName, type, message, presetKey })
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok || !data?.ok) throw new Error(data?.error || `HTTP ${r.status}`);

    // prepend newest event
    setFeed((prev) => [data.event, ...prev]);
  } catch (e) {
    console.error('simulateEvent error:', e);
    alert('Failed to add event.');
  }
}

  return (
    <div className="cheer-squad-section">
      <h3>👥 Cheer Squad</h3>

      {supporters.length === 0 ? (
        <p className="empty-state">
          No Cheer Squad yet. Invite friends or family to cheer you on!
        </p>
      ) : (
        <ul className="supporter-list">
          {supporters.map((s) => (
            <li key={s.id} className="supporter-item">
              <div className="supporter-meta">
                <span className="supporter-name">{s.name}</span>
                <span className="supporter-phone">{maskPhone(s.wa_phone)}</span>
              </div>
              <span className={`supporter-status ${s.status.toLowerCase()}`}>{s.status}</span>
              <button className="remove-btn" onClick={() => removeSupporter(s.id)} aria-label={`Remove ${s.name}`}>
                ✖
              </button>
            </li>
          ))}
        </ul>
      )}

      <button className="invite-btn" onClick={() => setShowInviteModal(true)}>
        ➕ Invite to Cheer Squad
      </button>

      {ownerId && (
  <div style={{ marginTop: 10 }}>
    <button
      className="cancel-button small"
      onClick={async () => {
        try {
          await ensureAnonAuth(); // make sure we have a uid
          const ownerName = prompt('Your first name for the invite?', 'Mia') || 'Mia';
          const { url } = await createJoinLink(ownerId, ownerName);
          setInviteLink(url);
          try { await navigator.clipboard.writeText(url); } catch {}
          alert('Invite link created and copied to clipboard.\nPaste it into SMS/WhatsApp/Email to send to Alex.');
        } catch (e) {
          console.error(e);
          alert('Failed to create join link. Check Firestore rules and console.');
        }
      }}
    >
      🔗 Create & Copy Join Link
    </button>

    {inviteLink && (
      <div style={{ fontSize: 13, marginTop: 6, wordBreak: 'break-all' }}>
        Link: <code>{inviteLink}</code>
      </div>
    )}
  </div>
)}

      {/* ---- DEMO: Streak Cheer button ---- */}
<div style={{ marginTop: 12 }}>
  <button
    className="cancel-button small"
    onClick={() =>
      simulateEvent({
        type: 'CHEER',
        message: '🏆 7-day streak! Every dose counts.' // customize milestone text
        // or use presetKey instead of message:
        // presetKey: 'EVERY_COUNTS'
      })
    }
  >
    🏆 Streak Cheer
  </button>
</div>

{/* ---- DEMO: Overdue Nudge button ---- */}
<div style={{ marginTop: 8 }}>
  <button
    className="cancel-button small"
    onClick={() =>
      simulateEvent({
        type: 'NUDGE',
        message: 'Overdue dose — quick reminder from your Cheer Squad.'
      })
    }
  >
    🔔 Send Overdue Nudge
  </button>
</div>

<button
  className="cancel-button small"
  style={{ marginLeft: 8 }}
  onClick={() =>
    simulateEvent({
      type: 'CHECKED',
      message: 'Checked-in'
    })
  }
>
  👍 Mark Checked-in
</button>

{/* ---- Support Feed ---- */}
<div style={{ marginTop: 16 }}>
  <h4 style={{ margin: '8px 0' }}>Messages from your Cheer Squad</h4>
  {feed.length === 0 ? (
    <p className="empty-state">No messages yet.</p>
  ) : (
    <ul className="supporter-list">
      {feed.map(ev => (
        <li key={ev.id} className="supporter-item">
          <div className="supporter-meta">
            <span className="supporter-name">{ev.supporterName}</span>
            <span className="supporter-phone" style={{ fontStyle: 'italic', color: '#555' }}>
              {ev.type === 'CHEER' ? `“${ev.message}”` : ev.message}
            </span>
          </div>
          <span className="supporter-status active">
            {ev.type === 'CHEER' ? 'Cheer' : ev.type === 'NUDGE' ? 'Nudge' : 'Checked'}
          </span>
        </li>
      ))}
    </ul>
  )}
</div>

      {/* ----- Invite Modal ----- */}
      {showInviteModal && (
        <div className="modal-backdrop" onClick={() => setShowInviteModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h4 style={{ marginTop: 0 }}>Invite a Pill-AI Cheer Pal</h4>
            <form onSubmit={addSupporter}>
              <label className="form-label">Name</label>
              <input
                className="form-input"
                type="text"
                placeholder="e.g., Alex"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />

              <label className="form-label">WhatsApp Number (E.164)</label>
              <input
                className="form-input"
                type="tel"
                placeholder="+64XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />

              <label className="form-check">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                <span style={{ marginLeft: 8 }}>
                  I confirm I have permission to invite this person to receive supportive messages.
                </span>
              </label>

              {error && <div className="form-error">{error}</div>}

              <div className="modal-actions">
                <button type="button" className="cancel-button" onClick={() => setShowInviteModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="send-button">Send Invite</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
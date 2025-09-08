// src/CheerSquad.jsx
import React, { useEffect, useState } from "react";

// 🔗 New utils you added earlier:
import {
  listenCheerSquad,       // real-time listener: users/{uid}/cheerSquad/*
  generateInviteCode,     // GET  /createInviteCode  -> { code, expiresAt }
  redeemInviteCode,       // POST /redeemInviteCode  -> { ok: true }
  removeCheerMate         // POST /removeCheerLink   -> { ok: true }
} from "./utils/firebase-db";

export default function CheerSquad() {
  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState(null); // { code, expiresAt }
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Subscribe to my single Cheer Squad list
    const off = listenCheerSquad(setMembers);
    return () => off && off();
  }, []);

async function onGenerateCode() {
  if (busy) return;
  setBusy(true);
  setStatus("Creating code…");
  try {
    const data = await generateInviteCode();     // { code, expiresAt }
    setInvite(data);
    setStatus("Code created.");
    try {
      await navigator.clipboard.writeText(data.code);
      setStatus("Code created & copied!");
    } catch {
      /* clipboard may be blocked — ignore */
    }
  } catch (e) {
    console.error(e);
    const msg = e?.message || "";
    if (msg.includes("VITE_FUNCTIONS_BASE_URL")) {
      setStatus("Server not configured (VITE_FUNCTIONS_BASE_URL).");
    } else if (msg.includes("NO_AUTH_USER")) {
      setStatus("Not signed in. Refresh the page and try again.");
    } else {
      setStatus("Could not create code.");
    }
  } finally {
    setBusy(false);
  }
}

async function onJoinByCode() {
  const code = joinCode.trim().toUpperCase();
  if (!code || busy) return;
  setBusy(true);
  setStatus("Joining…");
  try {
    await redeemInviteCode(code);
    setJoinCode("");
    setStatus("Joined! You both can cheer each other now.");
  } catch (e) {
    console.error(e);
    const msg = e?.message || "";
    if (msg.includes("VITE_FUNCTIONS_BASE_URL")) {
      setStatus("Server not configured (VITE_FUNCTIONS_BASE_URL).");
    } else if (msg.includes("NO_AUTH_USER")) {
      setStatus("Not signed in. Refresh the page and try again.");
    } else {
      setStatus("Invalid or expired code.");
    }
  } finally {
    setBusy(false);
  }
}

async function onRemove(uid) {
  if (busy) return;
  if (!confirm("Remove this person from BOTH Cheer Squads?")) return;
  setBusy(true);
  try {
    await removeCheerMate(uid); // server expects { uid } – already handled in utils
  } catch (e) {
    console.error(e);
    alert("Couldn’t remove right now.");
  } finally {
    setBusy(false);
  }
}

function renderExpiry(expiresAt) {
  if (!expiresAt) return "—";
  // Handle Firestore Timestamp, epoch seconds/ms, or ISO string
  const d = expiresAt?.toDate
    ? expiresAt.toDate()                                   // Firestore Timestamp
    : typeof expiresAt === "number"
      ? new Date(expiresAt < 2e10 ? expiresAt * 1000 : expiresAt) // seconds vs ms
      : new Date(expiresAt);                               // ISO string
  return isNaN(+d) ? "—" : d.toLocaleString("en-NZ");
}

  return (
    <div className="cheer-squad-section">
      <h3>👥 Cheer Squad</h3>

      {/* Actions row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "8px 0 12px" }}>
        <button className="invite-btn" onClick={onGenerateCode} disabled={busy}>
          ➕ Generate Invite Code
        </button>
        <div>
          <input
            className="form-input"
            placeholder="Enter code"
            value={joinCode}
            onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
            style={{ marginRight: 8, minWidth: 160 }}
          />
          <button className="send-button" onClick={onJoinByCode} disabled={busy}>
            Join by Code
          </button>
        </div>
      </div>

      {/* Show current invite code (if any) */}
      {invite && (
        <div className="invite-box" style={{ marginBottom: 12 }}>
          <div>
            <b>Your Invite Code:</b> <code>{invite.code}</code>{" "}
            <button
              className="cancel-button small"
              onClick={() => navigator.clipboard.writeText(invite.code)}
              style={{ marginLeft: 6 }}
            >
              Copy
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>
            Expires: {renderExpiry(invite.expiresAt)}
          </div>
        </div>
      )}

      {/* Status note */}
      {status && <div className="status-note" style={{ marginBottom: 12 }}>{status}</div>}

      {/* Single list */}
      {members.length === 0 ? (
        <p className="empty-state">No Cheer Squad yet. Generate a code or join with a code.</p>
      ) : (
        <ul className="supporter-list">
          {members.map((m) => (
            <li key={m.id} className="supporter-item squad-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div className="supporter-meta">
                <span className="supporter-name">{m.displayName || m.id}</span>
              </div>
              <button className="link danger" onClick={() => onRemove(m.id)} aria-label={`Remove ${m.displayName || m.id}`} disabled={busy}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
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

  useEffect(() => {
    // Subscribe to my single Cheer Squad list
    const off = listenCheerSquad(setMembers);
    return () => off && off();
  }, []);

  async function onGenerateCode() {
    setStatus("Creating code…");
    try {
      const data = await generateInviteCode();
      setInvite(data); // { code, expiresAt }
      setStatus("Code created.");
      try {
        await navigator.clipboard.writeText(data.code);
        setStatus("Code created & copied!");
      } catch {
        // clipboard might be blocked — it's fine.
      }
    } catch (e) {
      console.error(e);
      setStatus("Could not create code.");
    }
  }

  async function onJoinByCode() {
    const code = joinCode.trim().toUpperCase();
    if (!code) return;
    setStatus("Joining…");
    try {
      await redeemInviteCode(code);
      setJoinCode("");
      setStatus("Joined! You both can cheer each other now.");
    } catch (e) {
      console.error(e);
      setStatus("Invalid or expired code.");
    }
  }

  async function onRemove(uid) {
    if (!confirm("Remove this person from BOTH Cheer Squads?")) return;
    try {
      await removeCheerMate(uid); // mutual remove on server
    } catch (e) {
      console.error(e);
      alert("Couldn’t remove right now.");
    }
  }

  return (
    <div className="cheer-squad-section">
      <h3>👥 Cheer Squad</h3>

      {/* Actions row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "8px 0 12px" }}>
        <button className="invite-btn" onClick={onGenerateCode}>
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
          <button className="send-button" onClick={onJoinByCode}>
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
            Expires: {new Date(invite.expiresAt).toLocaleString()}
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
              <button className="link danger" onClick={() => onRemove(m.id)} aria-label={`Remove ${m.displayName || m.id}`}>
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
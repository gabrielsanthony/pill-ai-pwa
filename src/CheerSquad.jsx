// src/CheerSquad.jsx
import React, { useEffect, useMemo, useState } from "react";

// 🔗 New utils you added earlier:
import {
  listenCheerSquad,       // real-time: users/{uid}/cheerSquad/*
  generateInviteCode,     // GET  /createInviteCode  -> { code, expiresAt }
  redeemInviteCode,       // POST /redeemInviteCode  -> { ok: true }
  removeCheerMate,        // POST /removeCheerLink   -> { ok: true }
  getMyDisplayName,
  setMyDisplayName,
} from "./utils/firebase-db";

const SHOW_SET_NAME = true;


export default function CheerSquad({ onEditName = () => {} }) {
  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState(null); // { code, expiresAt }
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  // Live squad list
  useEffect(() => {
    const off = listenCheerSquad((rows) => setMembers(rows));
    return () => off && off();
  }, []);

  const ordered = useMemo(() => {
    return [...members].sort((a, b) =>
      (a.displayName || a.id).localeCompare(b.displayName || b.id)
    );
  }, [members]);

  const codeValid = /^[A-Z0-9]{6}$/.test(joinCode);


  function renderExpiry(expiresAt) {
    if (!expiresAt) return "—";
    const d = expiresAt?.toDate
      ? expiresAt.toDate()
      : typeof expiresAt === "number"
        ? new Date(expiresAt < 2e10 ? expiresAt * 1000 : expiresAt)
        : new Date(expiresAt);
    return isNaN(+d) ? "—" : d.toLocaleString("en-NZ");
  }

  async function ensureNameOnce() {
    const current = await getMyDisplayName();
    if (current && current.trim()) return current;
    const nick = prompt("Pick a display name your friends will see:", "")?.trim();
    if (!nick) return null;
    await setMyDisplayName(nick);
    return nick;
  }

  async function onGenerateCode() {
    if (busy) return;
    setBusy(true);
    setStatus("Creating code…");
    try {
      // Make sure you have a friendly name saved first
      const name = await ensureNameOnce();
      if (name === null) {
        setStatus("Invite cancelled (no name set).");
        return;
      }

      const data = await generateInviteCode(); // { code, expiresAt }
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
        setStatus("Not signed in. Refresh and try again.");
      } else {
        setStatus("Could not create code.");
      }
    } finally {
      setBusy(false);
    }
  }

  async function onJoinByCode(e) {
    e?.preventDefault?.();
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
        setStatus("Not signed in. Refresh and try again.");
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
      await removeCheerMate(uid); // mutual unlink
      // listener updates UI automatically
    } catch (e) {
      console.error(e);
      alert("Couldn’t remove right now.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="cheer-squad-section">
      <h3>👥 Cheer Squad</h3>

      {/* Actions row */}
      <div style={{ display: "flex", gap: 12, flexWrap: "wrap", margin: "8px 0 12px" }}>
        <button className="invite-btn" onClick={onGenerateCode} disabled={busy}>
          ➕ Generate Invite Code
        </button>

<form className="join-form" onSubmit={onJoinByCode}>
  <input
    className="join-input"
    placeholder="Enter code"
    value={joinCode}
    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
    inputMode="latin"
    autoCapitalize="characters"
    pattern="[A-Z0-9]{6}"
    maxLength={6}
    title="Enter the 6-character invite code"
    aria-label="Invite code"
  />
  <button className="send-button" type="submit" disabled={busy || !codeValid}>
    Join by Code
  </button>

  {SHOW_SET_NAME && (
    <button
      type="button"
      className="success-button"
      onClick={async () => {
        const current = await getMyDisplayName();
        const nick = prompt("Your display name:", current || "")?.trim();
        if (nick) {
          await setMyDisplayName(nick);
          setStatus("Saved your name.");
        }
      }}
      title="Set or change your display name"
    >
      Set my name
    </button>
  )}
</form>
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

      {/* Single list (nicknames) */}
      {ordered.length === 0 ? (
        <p className="empty-state">No Cheer Squad yet. Generate a code or join with a code.</p>
      ) : (
        <ul className="supporter-list">
          {ordered.map((m) => (
            <li
              key={m.id}
              className="supporter-item squad-row"
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
            >
              <div className="supporter-meta">
                <span className="supporter-name">{m.displayName || "Friend"}</span>
                <span className="supporter-phone" style={{ color: "#666", marginLeft: 8 }}>
                  linked
                </span>
              </div>
              <button
                className="link danger"
                onClick={() => onRemove(m.id)}
                aria-label={`Remove ${m.displayName || "Friend"}`}
                disabled={busy}
                title="Remove from Cheer Squad"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
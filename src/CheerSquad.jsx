// src/CheerSquad.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  listenCheerSquad,
  generateInviteCode,
  redeemInviteCode,
  removeCheerMate,
  getMyDisplayName,
  setMyDisplayName,
} from "./utils/firebase-db";

const SHOW_SET_NAME = true;

export default function CheerSquad() {
  const [members, setMembers] = useState([]);
  const [invite, setInvite] = useState(null); // { code, expiresAt }
  const [joinCode, setJoinCode] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  // popover state/refs for “Join by Code”
  const [joinOpen, setJoinOpen] = useState(false);
  const joinAnchorRef = useRef(null);
  const popoverRef = useRef(null);

  // 👇 NEW: popover state/refs for “Set my name”
  const [nameOpen, setNameOpen] = useState(false);
  const [tempName, setTempName] = useState('');
  const nameAnchorRef = useRef(null);
  const namePopoverRef = useRef(null);

  // Live squad list
  useEffect(() => {
    const off = listenCheerSquad((rows) => setMembers(rows));
    return () => off && off();
  }, []);

  const ordered = useMemo(
    () => [...members].sort((a, b) => (a.displayName || a.id).localeCompare(b.displayName || b.id)),
    [members]
  );

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
      } catch {/* clipboard may be blocked */ }
    } catch (e) {
      console.error(e);
      const msg = e?.message || "";
      if (msg.includes("VITE_FUNCTIONS_BASE_URL")) setStatus("Server not configured (VITE_FUNCTIONS_BASE_URL).");
      else if (msg.includes("NO_AUTH_USER")) setStatus("Not signed in. Refresh and try again.");
      else setStatus("Could not create code.");
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
      setJoinOpen(false); // close mini popup
      setStatus("Joined! You both can cheer each other now.");
    } catch (e) {
      console.error(e);
      const msg = e?.message || "";
      if (msg.includes("VITE_FUNCTIONS_BASE_URL")) setStatus("Server not configured (VITE_FUNCTIONS_BASE_URL).");
      else if (msg.includes("NO_AUTH_USER")) setStatus("Not signed in. Refresh and try again.");
      else setStatus("Invalid or expired code.");
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
    } catch (e) {
      console.error(e);
      alert("Couldn’t remove right now.");
    } finally {
      setBusy(false);
    }
  }

  // Close popover on outside click / Esc; autofocus input when opened
  useEffect(() => {
    function onDocClick(e) {
      if (!joinOpen) return;
      const p = popoverRef.current;
      const a = joinAnchorRef.current;
      if (p && !p.contains(e.target) && a && !a.contains(e.target)) setJoinOpen(false);
    }
    function onKey(e) { if (joinOpen && e.key === "Escape") setJoinOpen(false); }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onKey);
    if (joinOpen) setTimeout(() => popoverRef.current?.querySelector("input")?.focus(), 0);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [joinOpen]);

  return (
    <div className="cheer-squad-section">

      {/* Compact, single action row */}
      <div className="cs-actions-row">
        {SHOW_SET_NAME && (
<span className="cs-join-anchor cs-left" ref={nameAnchorRef}>            
  <button
              type="button"
              className="pill-btn pill-green"
              onClick={async () => {
                const current = (await getMyDisplayName()) || '';
                setTempName(current);
                setNameOpen((v) => !v);
              }}
              title="Set or change your display name"
              disabled={busy}
            >
              Set Name
            </button>

            {nameOpen && (
              <div className="cs-popover" ref={namePopoverRef} role="dialog" aria-label="Set your display name">
                <label className="cs-popover-label">Display name</label>
                <div className="cs-pop-row">
                  <input
                    className="form-input cs-code-input"
                    placeholder="e.g. Alex"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    aria-label="Display name"
                  />
                  <button
                    type="button"
                    className="send-button small"
                    onClick={async () => {
                      const nick = (tempName || '').trim();
                      if (!nick) { setStatus('Please enter a name.'); return; }
                      try {
                        setBusy(true);
                        await setMyDisplayName(nick);
                        setStatus('Saved your name.');
                        setNameOpen(false);
                      } catch (e) {
                        console.error(e);
                        setStatus('Could not save name right now.');
                      } finally {
                        setBusy(false);
                      }
                    }}
                    disabled={busy || !tempName.trim()}
                  >
                    Save
                  </button>
                </div>
                <div className="cs-pop-footer">
                  <button type="button" className="cancel-button small" onClick={() => setNameOpen(false)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </span>
        )}

        <button className="pill-btn pill-orange" onClick={onGenerateCode} disabled={busy}>
          Invite
        </button>

        <span className="cs-join-anchor" ref={joinAnchorRef}>
          <button
            type="button"
            className="pill-btn pill-blue"
            onClick={() => setJoinOpen((v) => !v)}
            disabled={busy}
            aria-haspopup="dialog"
            aria-expanded={joinOpen ? "true" : "false"}
          >
            Join
          </button>

          {joinOpen && (
            <div className="cs-popover" ref={popoverRef} role="dialog" aria-label="Join by code">
              <form onSubmit={onJoinByCode}>
                <label className="cs-popover-label">Invite code</label>
                <div className="cs-pop-row">
                  <input
                    className="form-input cs-code-input"
                    placeholder="ABC123"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    inputMode="latin"
                    autoCapitalize="characters"
                    pattern="[A-Z0-9]{6}"
                    maxLength={6}
                    title="Enter the 6-character invite code"
                    aria-label="Invite code"
                  />
                  <button className="send-button small" type="submit" disabled={busy || !codeValid}>
                    Join
                  </button>
                </div>
                <div className="cs-pop-footer">
                  <button type="button" className="cancel-button small" onClick={() => setJoinOpen(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}
        </span>
      </div>

      {/* Current invite code (if any) */}
      {invite && (
        <div className="invite-box" style={{ marginBottom: 12 }}>
          <div>
            <b>Your Invite Code:</b> <code>{invite.code}</code>{" "}
            <button
              className="success-button small"
              onClick={() => navigator.clipboard.writeText(invite.code)}
              style={{ marginLeft: 6 }}
            >
              Copy
            </button>
          </div>
          <div style={{ fontSize: 12, color: "#555" }}>Expires: {renderExpiry(invite.expiresAt)}</div>
        </div>
      )}

      {/* Status note */}
      {status && <div className="status-note" style={{ marginBottom: 12 }}>{status}</div>}

      {/* Squad list */}
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
                <span className="supporter-phone" style={{ color: "#666", marginLeft: 8 }}>linked</span>
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
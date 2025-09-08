// src/CheeringHub.jsx
import React, { useEffect, useMemo, useState } from "react";
import { listenCheerSquad, listenSupportEvents } from "./utils/firebase-db";

/**
 * CheeringHub = Messaging/feed view only.
 * - Reads your Cheer Squad (for a simple "send to" dropdown)
 * - Reads your incoming support feed (CHEER / NUDGE / CHECKED)
 * - Lets you send a quick Cheer/Nudge (optional)
 *
 * All invite/join/remove logic has moved to CheerSquad.jsx.
 */

export default function CheeringHub() {
  const [members, setMembers] = useState([]); // [{id, displayName}]
  const [feed, setFeed] = useState([]);      // [{id, supporterName, type, message, ts}]

  // quick-send state (optional)
  const [toUid, setToUid] = useState("");
  const [type, setType] = useState("CHEER"); // CHEER | NUDGE | CHECKED
  const [message, setMessage] = useState("You've got this!");
  const [status, setStatus] = useState("");

  // 1) Subscribe to my Cheer Squad list (to populate the "send to" dropdown)
  useEffect(() => {
    const off = listenCheerSquad((rows) => {
      const list = rows.map((r) => ({ id: r.id, name: r.displayName || r.id }));
      setMembers(list);
      // choose first member by default if none selected
      if (!toUid && list.length) setToUid(list[0].id);
    });
    return () => off && off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Subscribe to my incoming support events feed
  useEffect(() => {
    const off = listenSupportEvents((rows) => {
      // keep just the 3 recognised types
      const visible = rows
        .filter((r) => r.type === "CHEER" || r.type === "NUDGE" || r.type === "CHECKED")
        .sort((a, b) => (b.ts || 0) - (a.ts || 0));
      setFeed(visible);
    });
    return () => off && off();
  }, []);

  // (Optional) Quick send to a squad member using your existing API
  async function sendSupportEvent(e) {
    e?.preventDefault?.();
    if (!toUid) {
      setStatus("Select who to send to.");
      return;
    }
    try {
      setStatus("Sending…");
      const res = await fetch("/api/supportEvents/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toUid,
          type,
          message,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setStatus("Sent!");
      // no need to manually push to feed; listener will update if you're the recipient
    } catch (err) {
      console.error("sendSupportEvent error:", err);
      setStatus("Failed to send.");
    }
  }

  const hasMembers = useMemo(() => members.length > 0, [members]);

  return (
    <section className="cheer-hub-card">
      <h3>📣 Cheering Hub</h3>

      {/* --- Quick Send (optional) --- */}
      <form onSubmit={sendSupportEvent} className="quick-send" style={{ margin: "8px 0 16px" }}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="form-input"
            value={toUid}
            onChange={(e) => setToUid(e.target.value)}
            disabled={!hasMembers}
            aria-label="Send to"
          >
            {!hasMembers && <option value="">No Cheer Squad yet</option>}
            {members.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>

          <select
            className="form-input"
            value={type}
            onChange={(e) => setType(e.target.value)}
            aria-label="Message type"
          >
            <option value="CHEER">Cheer</option>
            <option value="NUDGE">Nudge</option>
            <option value="CHECKED">Checked-in</option>
          </select>

          <input
            className="form-input"
            style={{ minWidth: 220 }}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Write a short message"
            maxLength={120}
            aria-label="Message"
          />

          <button className="send-button" type="submit" disabled={!hasMembers}>
            Send
          </button>
        </div>

        {status && <div className="status-note" style={{ marginTop: 6 }}>{status}</div>}
      </form>

      {/* --- Feed --- */}
      <h4 style={{ margin: "8px 0" }}>Messages from your Cheer Squad</h4>
      {feed.length === 0 ? (
        <p className="empty-state">No messages yet.</p>
      ) : (
        <ul className="supporter-list">
          {feed.map((ev) => (
            <li key={ev.id} className="supporter-item" style={{ display: "flex", justifyContent: "space-between" }}>
              <div className="supporter-meta">
                <span className="supporter-name">{ev.supporterName || "Friend"}</span>
                <span className="supporter-phone" style={{ fontStyle: "italic", color: "#555" }}>
                  {ev.type === "CHEER" ? `“${ev.message}”` : ev.message}
                </span>
              </div>
              <span className={`supporter-status ${ev.type === "CHEER" ? "active" : "pending"}`}>
                {ev.type === "CHEER" ? "Cheer" : ev.type === "NUDGE" ? "Nudge" : "Checked"}
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
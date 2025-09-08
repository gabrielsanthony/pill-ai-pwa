// src/CheeringHub.jsx
import React, { useEffect, useMemo, useState } from "react";
import {
  listenCheerSquad,
  listenSupportEvents,
  addSupportEvent,
  getMyDisplayName,
  getCurrentUid,
} from "./utils/firebase-db";

/**
 * CheeringHub = Messaging/feed view only.
 * - Reads your Cheer Squad (for a simple "send to" dropdown)
 * - Reads your incoming support feed (CHEER / NUDGE / CHECKED)
 * - Lets you send a quick Cheer/Nudge
 *
 * Invite/join/remove lives in CheerSquad.jsx.
 */

export default function CheeringHub() {
  const [members, setMembers] = useState([]); // [{id, name}]
  const [feed, setFeed] = useState([]);      // [{id, supporterName, type, message, ts}]

  // quick-send state
  const [toUid, setToUid] = useState("");
  const [type, setType] = useState("CHEER"); // CHEER | NUDGE | CHECKED
  const [message, setMessage] = useState("You've got this!");
  const [status, setStatus] = useState("");

  // 1) Subscribe to my Cheer Squad list (to populate the "send to" dropdown)
  useEffect(() => {
    const off = listenCheerSquad((rows) => {
      const list = rows.map((r) => ({ id: r.id, name: r.displayName || "Friend" }));
      setMembers(list);
      if (!toUid && list.length) setToUid(list[0].id);
    });
    return () => off && off();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 2) Subscribe to my incoming support events feed (for ME = my uid)
  useEffect(() => {
    let off = () => {};
    (async () => {
      const ownerId = await getCurrentUid();
      if (!ownerId) return;
      off = listenSupportEvents(ownerId, (rows) => {
        const visible = rows
          .filter((r) => r.type === "CHEER" || r.type === "NUDGE" || r.type === "CHECKED")
          .sort(
            (a, b) =>
              (b.ts?.toMillis?.() || 0) - (a.ts?.toMillis?.() || 0)
          );
        setFeed(visible);
      });
    })();
    return () => off && off();
  }, []);

  // Quick send to a squad member using Firestore helper
  async function sendSupportEvent(e) {
    e?.preventDefault?.();
    if (!toUid) {
      setStatus("Select who to send to.");
      return;
    }
    try {
      setStatus("Sending…");
      const myName = (await getMyDisplayName()) || "Friend";
      await addSupportEvent(toUid, {
        type,
        message,
        supporterName: myName, // so recipient sees a friendly name in their feed
      });
      setStatus("Sent!");
      setMessage("You've got this!");
    } catch (err) {
      console.error("sendSupportEvent error:", err);
      setStatus("Failed to send.");
    }
  }

  const hasMembers = useMemo(() => members.length > 0, [members]);

  return (
    <section className="cheer-hub-card">
      <h3>📣 Cheering Hub</h3>

      {/* --- Quick Send --- */}
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
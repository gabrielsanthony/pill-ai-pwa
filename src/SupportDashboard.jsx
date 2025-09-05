// src/SupportDashboard.jsx
import React, { useEffect, useState } from 'react';
import { db } from './firebase-config';
import { addSupportEvent } from './utils/firebase-db';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';

export default function SupportDashboard() {
  const ownerId = localStorage.getItem('ownerId');
  const ownerName = localStorage.getItem('ownerName') || 'your friend';
  const supporterName = localStorage.getItem('supporterName') || 'Supporter';

  const [requests, setRequests] = useState([]);

  // Live list of NUDGE_REQUEST events
  useEffect(() => {
    if (!ownerId) return;
    const q = query(
      collection(db, 'owners', ownerId, 'supportEvents'),
      where('type', '==', 'NUDGE_REQUEST'),
      orderBy('ts', 'desc')
    );
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return () => unsub?.();
  }, [ownerId]);

  async function sendCheer(message, presetKey) {
    if (!ownerId) return alert('Owner not set yet.');
    try {
      await addSupportEvent(ownerId, {
        type: 'NUDGE',
        message: String(message || '').slice(0, 120),
        presetKey: presetKey || null,
        supporterName
      });
      alert('Sent!');
    } catch (e) {
      console.error(e);
      alert('Could not send message.');
    }
  }

  return (
    <div className="card support-card">
      <h3>🤝 You’re cheering {ownerName}</h3>

      <h4 style={{ marginTop: 12 }}>Requests</h4>
      {requests.length === 0 ? (
        <p>No nudge requests right now.</p>
      ) : (
        <ul className="supporter-list">
          {requests.map(r => (
            <li key={r.id} className="supporter-item">
              <div className="supporter-meta">
                <span className="supporter-name">Missed dose</span>
                <span className="supporter-phone" style={{ color:'#555' }}>
                  {r.doseTimeISO ? new Date(r.doseTimeISO).toLocaleString() : ''}
                </span>
              </div>

              <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
                <button className="cancel-button small"
                        onClick={() => sendCheer("You've got this.", 'GOT_THIS')}>
                  👏 You’ve got this
                </button>
                <button className="cancel-button small"
                        onClick={() => sendCheer("Every dose counts.", 'EVERY_COUNTS')}>
                  💪 Every dose counts
                </button>
                <button className="cancel-button small"
                        onClick={() => {
                          const txt = prompt('Your message (≤120 chars):', 'Proud of you for keeping at it!');
                          if (txt) sendCheer(txt, null);
                        }}>
                  💬 Custom
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
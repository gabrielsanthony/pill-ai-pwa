import React, { useEffect, useState } from 'react';
import { getXP, calculateLevel, subscribe } from './utils/xp.js';
import { AVATARS } from './gamification/schema.js';
import { getSelectedAvatarId, selectAvatar } from './gamification/avatars.js';

export default function EarnCard() {
  const [xp, setXp] = useState(() => getXP());
  const [level, setLevel] = useState(() => calculateLevel(getXP()));
  const [selectedId, setSelectedId] = useState(() => getSelectedAvatarId());

  useEffect(() => {
    const unsub = subscribe((newXP) => {
      setXp(newXP);
      setLevel(calculateLevel(newXP));
    });
    return unsub;
  }, []);

  function handleSelect(id, xpCost) {
    if (xp < xpCost) return; // locked
    selectAvatar(id);
    setSelectedId(id);
  }

  return (
    <div className="card earn-card">
      <h3>🏆 Earn & Avatars</h3>
      <p>
        <strong>🎖 Level:</strong> {level} &nbsp;|&nbsp; <strong>XP:</strong> {xp}
      </p>
      <progress value={xp % 100} max="100" style={{ width: '100%', marginBottom: '1rem' }} />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
          gap: '12px'
        }}
      >
        {AVATARS.map(av => {
          const locked = xp < av.xpCost;
          const isSelected = selectedId === av.id;
          return (
            <button
              key={av.id}
              onClick={() => handleSelect(av.id, av.xpCost)}
              disabled={locked}
              style={{
                position: 'relative',
                textAlign: 'center',
                padding: 10,
                borderRadius: 10,
                border: isSelected ? '2px solid #5b8cff' : '1px solid #ccc',
                background: '#fff',
                cursor: locked ? 'not-allowed' : 'pointer'
              }}
              title={locked ? `Locked · requires ${av.xpCost} XP` : `Select ${av.name}`}
            >
              <img
                src={av.img}
                alt={av.name}
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'contain',
                  opacity: locked ? 0.4 : 1
                }}
              />
              <div style={{ fontWeight: 600, marginTop: 6 }}>{av.name}</div>
              <div style={{ fontSize: 12, opacity: 0.8 }}>
                {locked ? `🔒 ${av.xpCost} XP` : (isSelected ? '✅ Selected' : 'Unlockable')}
              </div>

              {locked && (
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    borderRadius: 10,
                    background:
                      'linear-gradient(180deg, rgba(0,0,0,0.1), rgba(0,0,0,0.25))'
                  }}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

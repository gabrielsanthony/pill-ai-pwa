import React, { useEffect, useState } from 'react';
import { getXP, calculateLevel, subscribe } from './utils/xp.js';
import { AVATARS } from './gamification/schema.js';
import { getSelectedAvatarId, selectAvatar } from './gamification/avatars.js';
import MyPerksDemo from './components/MyPerksDemo'; // ✅ ensure this path matches where you saved it
import PerksStoreDemo from './components/PerksStoreDemo';

export default function EarnCard() {
  const [xp, setXp] = useState(() => getXP());
  const [level, setLevel] = useState(() => calculateLevel(getXP()));
  const [selectedId, setSelectedId] = useState(() => getSelectedAvatarId());
  const [openStore, setOpenStore] = useState(false); // ✅ NEW


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
      <h3>🏆 Earn</h3>
      <p>
        <strong>🎖 Level:</strong> {level} &nbsp;|&nbsp; <strong>XP:</strong> {xp}
      </p>
      <progress value={xp % 100} max="100" />

      <div className="avatar-grid">
        {AVATARS.map(av => {
          const locked = xp < av.xpCost;
          const isSelected = selectedId === av.id;
          return (
            <button
              key={av.id}
              onClick={() => handleSelect(av.id, av.xpCost)}
              disabled={locked}
              className={[
                'avatar-tile',
                locked ? 'locked' : '',
                isSelected ? 'selected' : ''
              ].join(' ').trim()}
              title={locked ? `Locked · requires ${av.xpCost} XP` : `Select ${av.name}`}
            >
              <img src={av.img} alt={av.name} className="avatar-img" />
              <div className="avatar-name">{av.name}</div>
              <div className="avatar-sub">
                {locked ? `🔒 ${av.xpCost} XP` : (isSelected ? '✅ Selected' : 'Unlockable')}
              </div>
            </button>
          );
        })}
      </div>
      {/* ✅ Open the demo store */}
      <div style={{ marginTop: 12 }}>
        <button onClick={() => setOpenStore(true)}>🏪 Open Health Perks Store (Demo)</button>
      </div>

      {/* ✅ Read-only overlay */}
      <PerksStoreDemo open={openStore} onClose={() => setOpenStore(false)} />
    </div>
  );
}
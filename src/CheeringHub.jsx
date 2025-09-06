import React, { useEffect, useMemo, useState } from 'react';
import SupportDashboard from './SupportDashboard.jsx';

export default function CheeringHub() {
  const [members, setMembers] = useState(() =>
    JSON.parse(localStorage.getItem('cheeringMemberships') || '[]')
  );
  const [selected, setSelected] = useState('all'); // 'all' | ownerId
  const [counts, setCounts] = useState({}); // { [ownerId]: number }

  // Keep in sync if another join happens this session
  useEffect(() => {
    const onStorage = () => {
      const list = JSON.parse(localStorage.getItem('cheeringMemberships') || '[]');
      setMembers(list);
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const selectedLabel = useMemo(() => {
    if (selected === 'all') return 'All Requests';
    const m = members.find(x => x.ownerId === selected);
    return m ? `Requests • ${m.ownerName}` : 'Requests';
  }, [selected, members]);

  return (
    <div className="cheer-hub card">
      <h3 style={{ marginTop: 0 }}>🤝 I’m Cheering</h3>

      <div className="cheer-hub-grid">
        {/* Sidebar / chips */}
        <aside className="cheer-side">
          <button
            className={`cheer-chip ${selected === 'all' ? 'active' : ''}`}
            onClick={() => setSelected('all')}
          >
            All
            {Object.values(counts).length > 0 && (
              <span className="badge">
                {Object.values(counts).reduce((a, b) => a + (b || 0), 0)}
              </span>
            )}
          </button>

          {members.length === 0 && (
            <div className="cheer-empty">No people yet. Join from an invite link.</div>
          )}

          {members.map(m => (
            <button
              key={m.ownerId}
              className={`cheer-chip ${selected === m.ownerId ? 'active' : ''}`}
              onClick={() => setSelected(m.ownerId)}
              title={`Cheering ${m.ownerName}`}
            >
              {m.ownerName}
              {typeof counts[m.ownerId] === 'number' && (
                <span className="badge">{counts[m.ownerId]}</span>
              )}
            </button>
          ))}
        </aside>

        {/* Main panel */}
        <main className="cheer-main">
          <h4 className="cheer-main-title">{selectedLabel}</h4>

          {selected === 'all' ? (
            members.length ? (
              members.map(m => (
                <section key={m.ownerId} className="cheer-person-section">
                  <h5 className="cheer-person-title">🧑‍🤝‍🧑 {m.ownerName}</h5>
                  <SupportDashboard
                    ownerId={m.ownerId}
                    ownerName={m.ownerName}
                    hideHeader
                    // let the dashboard tell us how many open requests it has
                    onPendingCount={(n) =>
                      setCounts(prev => ({ ...prev, [m.ownerId]: n }))
                    }
                  />
                </section>
              ))
            ) : (
              <div className="cheer-empty">No requests.</div>
            )
          ) : (
            <SupportDashboard
              ownerId={selected}
              ownerName={(members.find(x => x.ownerId === selected) || {}).ownerName}
              hideHeader
              onPendingCount={(n) => setCounts(prev => ({ ...prev, [selected]: n }))}
            />
          )}
        </main>
      </div>
    </div>
  );
}
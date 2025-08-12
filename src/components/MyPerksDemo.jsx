// src/components/MyPerksDemo.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { PERKS_DEMO } from '../perks/catalog';
import { getXP, subscribe } from '../utils/xp';

export default function MyPerksDemo() {
  const [xp, setXp] = useState(getXP());

  useEffect(() => {
    // React to XP changes from your gamification engine
    const unsub = typeof subscribe === 'function' ? subscribe((val) => setXp(val)) : null;
    return () => unsub && unsub();
  }, []);

  const rows = useMemo(() => {
    return PERKS_DEMO.map(perk => {
      const eligible = xp >= perk.xpCost;
      return { ...perk, eligible };
    });
  }, [xp]);

  return (
    <section aria-labelledby="my-perks-demo-title" style={styles.wrap}>
      <div style={styles.headerRow}>
        <h3 id="my-perks-demo-title" style={styles.title}>📋 My Perks (Demo)</h3>
        <div style={styles.xpBox} aria-label={`Current XP ${xp}`}>
          XP: <strong>{xp}</strong>
        </div>
      </div>

      <div style={styles.legend}>
        <span style={{ ...styles.badge, ...styles.badgeOk }}>Eligible</span>
        <span style={{ ...styles.badge, ...styles.badgeLock }}>Locked</span>
        <span style={styles.demoNote}>Demo only — no redemption</span>
      </div>

      <div role="table" aria-label="Perks list" style={styles.table}>
        <div role="row" style={{ ...styles.row, ...styles.head }}>
          <div role="columnheader" style={{ ...styles.cell, flex: 3 }}>Perk</div>
          <div role="columnheader" style={{ ...styles.cell, flex: 2 }}>Partner</div>
          <div role="columnheader" style={{ ...styles.cell, flex: 1, textAlign: 'right' }}>XP Required</div>
          <div role="columnheader" style={{ ...styles.cell, flex: 1 }}>Status</div>
        </div>

        {rows.map(perk => (
          <div role="row" key={perk.id} style={styles.row}>
            <div role="cell" style={{ ...styles.cell, flex: 3 }}>
              <span style={styles.icon}>{perk.icon}</span>
              <span style={styles.perkName}>{perk.name}</span>
            </div>
            <div role="cell" style={{ ...styles.cell, flex: 2, color: '#555' }}>
              {perk.partner}
            </div>
            <div role="cell" style={{ ...styles.cell, flex: 1, textAlign: 'right' }}>
              {perk.xpCost}
            </div>
            <div role="cell" style={{ ...styles.cell, flex: 1 }}>
              <span
                style={{
                  ...styles.badge,
                  ...(perk.eligible ? styles.badgeOk : styles.badgeLock)
                }}
                aria-label={perk.eligible ? 'Eligible' : 'Locked'}
              >
                {perk.eligible ? 'Eligible' : 'Locked'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

const styles = {
  wrap: { marginTop: 12, background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: 12 },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  title: { margin: 0, fontSize: 16, fontWeight: 700 },
  xpBox: { fontSize: 14, padding: '4px 8px', borderRadius: 6, background: '#F6F6F6', border: '1px solid #EAEAEA' },
  legend: { display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 10, fontSize: 12 },
  badge: { display: 'inline-block', padding: '4px 8px', borderRadius: 999, border: '1px solid transparent' },
  badgeOk: { background: '#EAF8EA', borderColor: '#B8E4B8', color: '#1F7A1F' },
  badgeLock: { background: '#F4F4F4', borderColor: '#E4E4E4', color: '#666' },
  demoNote: { color: '#666' },
  table: { display: 'grid', gap: 6 },
  row: { display: 'flex', alignItems: 'center', padding: '8px 6px', borderRadius: 8, border: '1px solid #F0F0F0' },
  head: { background: '#FBFBFB', borderColor: '#EFEFEF', fontWeight: 700 },
  cell: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14 },
  icon: { fontSize: 18 },
  perkName: { fontWeight: 600 }
};
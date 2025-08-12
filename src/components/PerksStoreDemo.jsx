// src/components/PerksStoreDemo.jsx
import React from 'react';
import { PERKS_DEMO } from '../perks/catalog';
import { getXP } from '../utils/xp';

export default function PerksStoreDemo({ open, onClose }) {
  const xp = getXP();
  if (!open) return null;

  return (
    <div style={styles.backdrop} onClick={onClose} role="button" aria-label="Close Demo Store">
      <div style={styles.sheet} onClick={(e) => e.stopPropagation()}>
        <div style={styles.header}>
          <div style={styles.title}>🏪 Health Perks Store — Demo</div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">✖</button>
        </div>

        <div style={styles.banner}>
          <strong>Demo only:</strong> Preview of potential partner perks. No redemption.
        </div>

        <div style={styles.xpRow}>
          <span>Your XP:</span> <strong>{xp}</strong>
        </div>

        <div style={styles.grid}>
          {PERKS_DEMO.map(perk => {
            const eligible = xp >= perk.xpCost;
            return (
              <div key={perk.id} style={styles.card}>
                <div style={styles.icon}>{perk.icon}</div>
                <div style={styles.name}>{perk.name}</div>
                <div style={styles.partner}>at {perk.partner}</div>
                <div style={styles.desc}>{perk.desc}</div>
                <div style={styles.price}>{perk.xpCost} XP required</div>

                {/* Read-only status only */}
                <button
                  style={eligible ? styles.btnEligible : styles.btnLocked}
                  disabled
                  title="Demo only"
                >
                  {eligible ? 'Eligible (Demo)' : 'Not enough XP (Demo)'}
                </button>
              </div>
            );
          })}
        </div>

        <div style={styles.footerNote}>
          Future: enable redemption, codes, and partner terms.
        </div>
      </div>
    </div>
  );
}

const styles = {
  backdrop: {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
  },
  sheet: {
    width: 'min(920px, 92vw)', maxHeight: '86vh', overflow: 'auto',
    background: '#fff', borderRadius: 12, boxShadow: '0 10px 30px rgba(0,0,0,0.25)',
    padding: 16
  },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  title: { fontSize: 20, fontWeight: 700 },
  closeBtn: { border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer' },
  banner: {
    background: '#E9F3FF', border: '1px solid #B9DAFF', color: '#05315A',
    padding: 10, borderRadius: 8, marginBottom: 12, fontSize: 14
  },
  xpRow: { display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 12, fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
  card: { border: '1px solid #eee', borderRadius: 10, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 },
  icon: { fontSize: 28 },
  name: { fontWeight: 700 },
  partner: { fontSize: 13, color: '#666' },
  desc: { fontSize: 13, color: '#444' },
  price: { marginTop: 6, fontWeight: 600 },
  btnEligible: {
    marginTop: 8, padding: '8px 10px', borderRadius: 8,
    border: '1px solid #9fd49f', background: '#eaf8ea', color: '#1f7a1f', cursor: 'not-allowed'
  },
  btnLocked: {
    marginTop: 8, padding: '8px 10px', borderRadius: 8,
    border: '1px solid #eee', background: '#f7f7f7', color: '#888', cursor: 'not-allowed'
  },
  footerNote: { marginTop: 10, fontSize: 12, color: '#666' }
};
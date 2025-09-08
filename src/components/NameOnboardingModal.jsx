// src/components/NameOnboardingModal.jsx
import { useState, useEffect } from 'react';
import Modal from './Modal.jsx';
import { setMyDisplayName } from '../utils/firebase-db';

export default function NameOnboardingModal({
  isOpen,
  onClose,
  defaultName = ''
}) {
  const [name, setName] = useState(defaultName);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setName(defaultName || '');
    setError('');
    setSaving(false);
  }, [defaultName, isOpen]);

  async function save() {
    const n = (name || '').trim();
    if (!n) {
      setError('Please enter a name.');
      return;
    }
    try {
      setSaving(true);
      await setMyDisplayName(n);
      onClose(true); // pass success
    } catch {
      setError('Could not save name. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={() => onClose(false)}>
      <h3 style={{ marginTop: 0 }}>Pick a nickname</h3>
      <p style={{ marginTop: 6 }}>
        Friends in your Cheer Squad will see this name.
      </p>

      <input
        type="text"
        className="form-input"
        placeholder="e.g., Alex"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        maxLength={40}
      />

      {error && <div className="form-error" style={{ marginTop: 8 }}>{error}</div>}

      <div className="modal-actions" style={{ marginTop: 12 }}>
        <button
          type="button"
          className="cancel-button"
          onClick={() => onClose(false)}
          disabled={saving}
        >
          Skip for now
        </button>
        <button
          type="button"
          className="send-button"
          onClick={save}
          disabled={saving}
          style={{ marginLeft: 8 }}
        >
          {saving ? 'Saving…' : 'Save name'}
        </button>
      </div>
    </Modal>
  );
}
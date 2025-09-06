// src/components/Modal.jsx
import React, { useEffect, useRef } from 'react';

export default function Modal({ open, onClose, title, children }) {
  const closeBtnRef = useRef(null);
  const prevFocusRef = useRef(null);

  // ✅ Hooks must run on every render. Guard the effect body with `if (!open) return;`
  useEffect(() => {
    if (!open) return;

    // lock background scroll
    document.body.classList.add('modal-open');

    // remember previously focused element and move focus into the modal
    prevFocusRef.current = document.activeElement;
    const id = requestAnimationFrame(() => closeBtnRef.current?.focus());

    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();

      // simple focus trap (Tab cycles inside modal)
      if (e.key === 'Tab') {
        const root = document.getElementById('pillai-modal-root');
        const focusables = root?.querySelectorAll(
          'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables || !focusables.length) return;
        const list = Array.from(focusables);
        const first = list[0];
        const last = list[list.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.classList.remove('modal-open');
      cancelAnimationFrame(id);
      // restore focus to previously focused element
      prevFocusRef.current && prevFocusRef.current.focus?.();
    };
  }, [open, onClose]);

  // Render nothing when closed
  if (!open) return null;

  const stop = (e) => e.stopPropagation();

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        id="pillai-modal-root"
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={stop}
      >
        <div className="modal-header">
          <h3 style={{ margin: 0 }}>{title}</h3>
          <button
            ref={closeBtnRef}
            className="modal-close"
            aria-label="Close"
            onClick={onClose}
          >
            ×
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}
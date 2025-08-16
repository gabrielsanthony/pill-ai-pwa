import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Single registration at the root, then bind to the *ready* SW.
// IMPORTANT: the file must exist at /public/firebase-messaging-sw.js (served at /firebase-messaging-sw.js)
async function registerMessagingSW() {
  if (!('serviceWorker' in navigator)) return null;

  // Register WITHOUT a query string – avoids duplicate registrations
  const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');

  // If there’s a waiting SW (from an update), ask it to activate now
  if (registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }

  // Optional: log install/activate progress
  registration.addEventListener('updatefound', () => {
    const sw = registration.installing;
    sw?.addEventListener('statechange', () => {
      console.log('SW state changed to:', sw.state);
    });
  });

  // Wait for the active/controlling registration
  const ready = await navigator.serviceWorker.ready;

  // Expose globally so firebase-notifications.js can pass this to getToken()
  window.__PILLAI_SW_REG__ = ready;

  console.log('✅ SW ready @ scope:', ready.scope);
  return ready;
}

// Fire-and-forget at startup
registerMessagingSW();

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
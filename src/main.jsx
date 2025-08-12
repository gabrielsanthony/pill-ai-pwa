import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// --- Service Worker Registration (single, versioned) ---
if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/firebase-messaging-sw.js?v=2.0.0', { scope: '/' })
    .then((registration) => {
      console.log('✅ Service Worker registered with scope:', registration.scope);

      // If there's a waiting SW, tell it to activate immediately
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }

      // Optional: listen for updates
      registration.addEventListener('updatefound', () => {
        const sw = registration.installing;
        sw?.addEventListener('statechange', () => {
          console.log('SW state changed to:', sw.state);
        });
      });
    })
    .catch((error) => {
      console.error('❌ Service Worker registration failed:', error);
    });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// src/InstallAppButton.jsx
import { useEffect, useState } from 'react';

export default function InstallAppButton({ variant = 'primary', className }){
  const isStandalone =
    (typeof window !== 'undefined' && window.matchMedia?.('(display-mode: standalone)').matches) ||
    (typeof navigator !== 'undefined' && navigator.standalone === true);

  const [deferred, setDeferred] = useState(null);
  const [installed, setInstalled] = useState(!!isStandalone);

  useEffect(() => {
    function onPrompt(e){ e.preventDefault(); setDeferred(e); }
    function onInstalled(){ setInstalled(true); }

    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (installed) return null;

  const click = async () => {
    if (!deferred) {
      alert('On iPhone/iPad: Share → “Add to Home Screen”.');
      return;
    }
    deferred.prompt();
    const choice = await deferred.userChoice.catch(() => null);
    setDeferred(null);
    if (choice?.outcome === 'accepted') setInstalled(true);
  };

  const btnClass = className ?? (variant === 'primary' ? 'send-button' : 'invite-btn');
  return <button className={btnClass} onClick={click}>Install app</button>;
}
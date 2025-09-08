// src/IosInstallHint.jsx
import { useEffect, useState } from 'react';

export default function IosInstallHint() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const isStandalone = window.navigator.standalone === true ||
      window.matchMedia('(display-mode: standalone)').matches;
    const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (isIOS && !isStandalone) setShow(true);
  }, []);
  if (!show) return null;
  return (
    <div className="card notice" style={{padding:12, margin:'8px 0'}}>
      <b>Add to Home Screen</b> on iPhone/iPad:
      <ol style={{margin:'6px 0 0 16px'}}>
        <li>Tap the <span style={{fontStyle:'italic'}}>Share</span> button</li>
        <li>Choose <b>Add to Home Screen</b></li>
      </ol>
    </div>
  );
}
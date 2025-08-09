// src/firebase-notifications.js
import { getToken, onMessage, getMessaging } from "firebase/messaging";
import { app } from "./firebase-config"; // whatever exports your initialized Firebase app

// Reuse the app's messaging instance
const messaging = getMessaging(app);

// ✅ Your public VAPID key
const VAPID_KEY =
  "BB12zXeJSqQ73BnhGfMBQWsc5ww-1p_Ftaf8zcYeoKWXrbD9e2h2nzibSlOuqWNkJDeK3nrCHlkYJOQ5CufuVys";

export const requestPermissionAndGetToken = async () => {
  try {
    console.log("[FCM] Requesting notification permission…");
    const permission = await Notification.requestPermission();
    if (permission !== "granted") {
      console.warn("[FCM] Permission not granted");
      return null;
    }

    // 👇 Ensure the FCM service worker is registered and pass it to getToken
    const registration =
      (await navigator.serviceWorker.getRegistration("/firebase-messaging-sw.js")) ||
      (await navigator.serviceWorker.register("/firebase-messaging-sw.js"));

    console.log("[FCM] Service Worker registered:", registration);

    console.log(
      "[FCM] Using VAPID key:",
      VAPID_KEY ? VAPID_KEY.slice(0, 12) + "…" : "(missing)"
    );

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration, // 👈 important for desktop
    });

    if (!token) {
      console.warn("[FCM] No push token available");
      return null;
    }

    console.log("[FCM] Token acquired:", token.slice(0, 12) + "…");
    return token;
  } catch (err) {
    console.error("[FCM] Error while retrieving token:", err);
    return null;
  }
};

// Optional foreground handler
// onMessage(messaging, (payload) => {
//   console.log("📩 Foreground message:", payload);
// });
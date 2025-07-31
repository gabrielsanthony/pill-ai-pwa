// src/firebase-messaging.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyD4IIK7DRJLGE5bKNe5J0W2ufbyUWsA4oc",
    authDomain: "pill-ai-935d5.firebaseapp.com",
      projectId: "pill-ai-935d5",
        storageBucket: "pill-ai-935d5.appspot.com",
          messagingSenderId: "861184373325",
            appId: "1:861184373325:web:c0589d6a64e1c1fa046204"
            };

            const app = initializeApp(firebaseConfig);
            const messaging = getMessaging(app);

            export const requestNotificationPermission = async () => {
              try {
                  const permission = await Notification.requestPermission();
                      if (permission === 'granted') {
                            const token = await getToken(messaging, {
                                    vapidKey: 'BB12zXeJSqQ73BnhGfMBQWsc5ww-1p_Ftaf8zcYeoKWXrbD9e2h2nzibSlOuqWNkJDeK3nrCHlkYJOQ5CufuVys',
                                    serviceWorkerRegistration: await navigator.serviceWorker.register('/firebase-messaging-sw.js'),
                                          });
                                                console.log('✅ Push token:', token);
                                                      return token;
                                                          } else {
                                                                console.warn('❌ Notification permission denied');
                                                                      return null;
                                                                          }
                                                                            } catch (err) {
                                                                                console.error('❌ Error while retrieving token:', err);
                                                                                    return null;
                                                                                      }
                                                                                      };

                                                                                      onMessage(messaging, (payload) => {
                                                                                        console.log('🔔 Foreground push received:', payload);
                                                                                        });
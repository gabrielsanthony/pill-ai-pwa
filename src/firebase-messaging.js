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
                                    vapidKey: 'BMezexq4S4zz4jkejASOtjwWwMDN6jHeLCi2iUdBEAeTcV70XHvNkDLCd84cSfB1Tu-FgMXqVtik5Xb7uUILciA',
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
                                                                                      console.log('📩 Foreground message received:', payload);

                                                                                      if (Notification.permission === 'granted') {
                                                                                        const { notification } = payload;

                                                                                        if (notification?.title && notification?.body) {
                                                                                          console.log('🧠 Attempting to display foreground notification');
                                                                                          try {
                                                                                            const notif = new Notification(notification.title, {
                                                                                              body: notification.body,
                                                                                              requireInteraction: true,
                                                                                            });

                                                                                            notif.onclick = () => {
                                                                                              console.log('👆 Notification clicked!');
                                                                                              window.focus();
                                                                                            };
                                                                                          } catch (error) {
                                                                                            console.error('❌ Failed to show Notification:', error);
                                                                                          }
                                                                                        } else {
                                                                                          console.warn('❗ Missing title/body in payload:', payload);
                                                                                        }
                                                                                      } else {
                                                                                        console.warn('❌ Notification permission not granted at display time.');
                                                                                      }
                                                                                    });
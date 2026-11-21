importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging-compat.js");
firebase.initializeApp({
  apiKey: "AIzaSyB15ayhYGwbiIeJeTZYkjAH9OShmry0cBc",
  authDomain: "sri-gayatri-vilas.firebaseapp.com",
  projectId: "sri-gayatri-vilas",
  storageBucket: "sri-gayatri-vilas.firebasestorage.app",
  messagingSenderId: "775106943155",
  appId: "1:775106943155:web:a26f0ed6ce931ad1a078c6"
});
const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};
  const title = data.title || "Sri Gayatri Vilas";
  const options = {
    body: data.body || "A new customer order has arrived.",
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    data: {
      url: data.url || "/admin?section=Orders"
    },
    tag: data.orderId || "new-customer-order",
    renotify: true
  };

  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/admin?section=Orders",
    self.location.origin
  ).href;

  event.waitUntil((async () => {
    const windows = await self.clients.matchAll({
      type: "window",
      includeUncontrolled: true
    });

    for (const client of windows) {
      if (client.url.startsWith(self.location.origin) && "focus" in client) {
        await client.navigate(targetUrl);
        return client.focus();
      }
    }

    return self.clients.openWindow(targetUrl);
  })());
});
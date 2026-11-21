importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.4.0/firebase-messaging-compat.js");
importScripts("/api/notifications/firebase-config");

firebase.initializeApp(self.SGV_FIREBASE_CONFIG);

const messaging = firebase.messaging();

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

messaging.onBackgroundMessage((payload) => {
  const data = payload.data || {};

  return self.registration.showNotification(
    data.title || "Sri Gayatri Vilas",
    {
      body: data.body || "A new customer order has arrived.",
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      data: {
        url: data.url || "/admin?section=Orders"
      },
      tag: data.orderId || "new-customer-order",
      renotify: true
    }
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  const targetUrl = new URL(
    event.notification.data?.url || "/admin?section=Orders",
    self.location.origin
  ).href;

  event.waitUntil(
    self.clients.openWindow(targetUrl)
  );
});

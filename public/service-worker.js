self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", (event) => {
  const { title, body, icon, actions = [] } = event.data;

  self.registration.showNotification(title, {
    body,
    icon,
    actions,
  });
});

self.addEventListener("notificationclick", (event) => {
  const targetUrl = event.notification.data?.url || "/";

  if (event.action === "handle_accept_call") {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "accept_call" });
      });
    });
  }

  if (event.action === "handle_reject_call") {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({ type: "reject_call" });
      });
    });
  }

  // event.notification.close();
});

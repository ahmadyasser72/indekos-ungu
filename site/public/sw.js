self.addEventListener("push", (event) => {
	const { title, body, url = "/dashboard", imagePath } = event.data.json();

	event.waitUntil(
		self.registration.showNotification(title, {
			body,
			icon: "/favicon.svg",
			image: imagePath ? `/api/uploads/${imagePath}` : undefined,
			data: { url },
		}),
	);
});

self.addEventListener("notificationclick", (event) => {
	event.notification.close();

	event.waitUntil(
		clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then((clientList) => {
				for (const client of clientList) {
					if (client.url === event.notification.data.url && "focus" in client) {
						return client.focus();
					}
				}
				return clients.openWindow(event.notification.data.url);
			}),
	);
});

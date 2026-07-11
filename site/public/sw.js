/// <reference lib="webworker" />
/** @type {ServiceWorkerGlobalScope} */
const sw = self;

sw.addEventListener("push", (event) => {
	const {
		title,
		body,
		url = "/dashboard",
		urlHtmx,
		imagePath,
	} = event.data.json();

	event.waitUntil(
		sw.registration.showNotification(title, {
			body,
			icon: "/favicon.svg",
			image: imagePath ? `/api/uploads/${imagePath}` : undefined,
			data: { url, htmx: urlHtmx },
		}),
	);
});

sw.addEventListener("notificationclick", (event) => {
	event.notification.close();

	const { url, htmx } = event.notification.data;
	event.waitUntil(
		sw.clients
			.matchAll({ type: "window", includeUncontrolled: true })
			.then(async (clientList) => {
				for (const client of clientList) {
					if (client.url === url && "focus" in client) {
						if (htmx) {
							client.postMessage({ type: "url-htmx", value: htmx });
						}

						return client.focus();
					}
				}

				const window = await sw.clients.openWindow(url);
				if (window && htmx) {
					window.postMessage({ type: "url-htmx", value: htmx });
				}
			}),
	);
});

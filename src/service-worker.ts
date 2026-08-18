/// <reference lib="esnext" />
/// <reference lib="webworker" />
/// <reference types="@sveltejs/kit" />
import { build, files, prerendered, version } from "$service-worker";

/**
 * Offline for the kitchen, per ADR-0006.
 *
 * Everything the app needs is known at build time — it is one prerendered page with no
 * server behind it — so the whole build is precached on install and served from the cache,
 * with the network only as the fallback for anything unexpected.
 *
 * Registration is deliberately manual, in `$lib/pwa`, so that `pnpm dev` runs with no
 * service worker at all.
 */

const worker = self as unknown as ServiceWorkerGlobalScope;

/**
 * Named for the build, so a new deployment fills a fresh cache and drops the previous one
 * on activation rather than serving last week's assets.
 */
const CACHE = `pizza-calc-${version}`;

/** The app itself, the contents of `static/`, and the prerendered page. */
const PRECACHED = new Set([...build, ...files, ...prerendered]);

worker.addEventListener("install", (event) => {
	// Take over as soon as this worker is ready rather than waiting for every tab holding
	// the old one to close. An installed home-screen app can stay warm for weeks, and the
	// page it replaces has already loaded everything it needs.
	worker.skipWaiting();

	event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll([...PRECACHED])));
});

worker.addEventListener("activate", (event) => {
	async function dropOtherCaches() {
		for (const key of await caches.keys()) {
			if (key !== CACHE) await caches.delete(key);
		}
	}

	event.waitUntil(dropOtherCaches());
});

worker.addEventListener("fetch", (event) => {
	// Anything that is not a plain read is none of our business.
	if (event.request.method !== "GET") return;

	event.respondWith(respond(event.request));
});

async function respond(request: Request): Promise<Response> {
	const url = new URL(request.url);

	// This is also the path a navigation takes, hash and all: a fragment is not part of a
	// cache key, so a shared Recipe link opens with no connection.
	if (url.origin === worker.location.origin && PRECACHED.has(url.pathname)) {
		const cached = await caches.match(url.pathname, { cacheName: CACHE });
		if (cached) return cached;
	}

	return fetch(request);
}

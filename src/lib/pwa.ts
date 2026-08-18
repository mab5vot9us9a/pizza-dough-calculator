import { dev } from "$app/environment";
import { base } from "$app/paths";

/**
 * Installing the app, per ADR-0006.
 *
 * The service worker is what makes the app usable with no connection — and on iOS, being
 * installed to the home screen is also what exempts the stored session from Safari's
 * seven-day purge (ADR-0005), so this is part of why session restore is reliable there.
 */

/**
 * Registers the service worker, outside development.
 *
 * Automatic registration is off (see `vite.config.ts`): during development there is no
 * service worker at all, so an edit is never answered out of a stale cache.
 */
export function registerServiceWorker(): void {
	if (dev || !("serviceWorker" in navigator)) return;

	// The browser checks for a newer worker on each full page load, and a newer one takes
	// over immediately — see `skipWaiting` in the worker itself.
	void navigator.serviceWorker.register(`${base}/service-worker.js`);
}

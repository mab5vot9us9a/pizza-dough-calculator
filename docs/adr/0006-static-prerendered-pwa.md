# The app ships as a static prerendered PWA

Everything the app does — solving weights, deriving schedules, storing state — happens in the
browser. There is no server-side work, so `@sveltejs/adapter-node` from the SvelteKit scaffold has
been replaced with `@sveltejs/adapter-static` and the app is prerendered to plain files. On top of
that it ships a manifest and a service worker, making it installable and fully usable offline.

## Consequences

Being installable is not only a convenience. Safari on iOS exempts home-screen web apps from the
seven-day storage purge described in ADR-0005, so making the app installable is also what makes
session restore reliable on iPhone — the platform this app is designed for. Offline capability
matters for the actual setting too: a kitchen, mid-bulk-ferment, on bad wifi, with floury hands.

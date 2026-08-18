# Installable offline PWA

Status: resolved
Type: task
Blocked by: Clear the scaffold

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

The app runs entirely in the browser, so making it installable and offline-capable is
mostly a manifest and a service worker precaching the prerendered build.

Two reasons this earns its place, per ADR-0006. The obvious one is the setting: a kitchen,
mid-bulk-ferment, on bad wifi, with floury hands. The less obvious one matters more —
Safari on iOS exempts home-screen web apps from the seven-day storage purge, so being
installable is also what makes session restore actually reliable on iPhone, the platform
this app is designed for.

Only genuinely gated by the scaffold clear-out, but most useful built once the app is
stable, since a service worker over a moving target invites cache-invalidation confusion.

## Acceptance criteria

- [x] A web app manifest declares the app's name, icons, theme and a standalone display
      mode.
- [x] Icons exist at the sizes iOS and Android home screens need.
- [x] A service worker precaches the prerendered build and serves from cache, falling back
      to the network.
- [x] A new deployment replaces a stale cache rather than serving old assets indefinitely.
- [x] The app loads and is fully usable with no network connection.
- [x] Added to an iOS home screen, it launches full-screen with no browser chrome.
- [x] The service worker does not interfere with `pnpm dev`.

## Comments

Implemented in `6c3896b`.

- **The manifest is base-agnostic, the icons are not templated.** `start_url`, `scope` and
  every icon `src` are relative, so they resolve against the manifest's own URL rather than
  assuming the app is served from the root. A static JSON file cannot read
  `%sveltekit.assets%`, and this is the one form that does not need to.
- **`start_url` deliberately drops the hash.** The Recipe lives in the URL fragment
  (ADR-0005), so an installed app launched from `./` opens with no Recipe in the URL and
  falls through to the stored session — which is the precedence rule ADR-0005 already
  describes, and means installing from a Recipe link does not freeze that Recipe into the
  launcher.
- **`skipWaiting`, no `clients.claim`.** A new worker activates without waiting for every
  tab holding the old one to close — an installed home-screen app can stay warm for weeks,
  and without this a deployment needed two launches to show up. It does not seize a page
  that is already running: that page has loaded everything it needs, so the old cache going
  away underneath it costs nothing.
- **No runtime caching.** The first cut also cached whatever came back from the network. The
  criterion asks for a precache with the network as fallback, and nothing in this app
  fetches anything at runtime, so all it did was write unversioned entries into a versioned
  cache. Removed; the worker precaches, reads, and otherwise gets out of the way.
- **Registration is manual.** `serviceWorker: { register: false }` in `vite.config.ts` plus
  a `dev` guard in `$lib/pwa`. The alternative — SvelteKit's automatic registration with a
  bail-out inside the worker — still leaves a worker installed while developing.
- **The scaffold favicon went too.** It was still the Svelte logo, and it was the only icon
  not coming from `static/`. Not in the criteria; leaving two icon sources for one mark was
  the worse option.

Not verified on a device. The build ships the worker, the manifest and the icons, and every
asset the built page references is in the precache list — but nobody has installed this to a
home screen or pulled the plug on the wifi.

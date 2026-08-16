# Installable offline PWA

Status: ready-for-agent
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

- [ ] A web app manifest declares the app's name, icons, theme and a standalone display
      mode.
- [ ] Icons exist at the sizes iOS and Android home screens need.
- [ ] A service worker precaches the prerendered build and serves from cache, falling back
      to the network.
- [ ] A new deployment replaces a stale cache rather than serving old assets indefinitely.
- [ ] The app loads and is fully usable with no network connection.
- [ ] Added to an iOS home screen, it launches full-screen with no browser chrome.
- [ ] The service worker does not interfere with `pnpm dev`.

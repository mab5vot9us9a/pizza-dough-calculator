# Clear the scaffold

Status: resolved
Type: task
Blocked by: None — can start immediately

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

The repo should contain only pizza-calc code. SvelteKit's scaffold ships demo routes and an
example test that have nothing to do with this app; every later ticket is easier to reason
about once they are gone. The layout should also carry the mobile-first foundations — the
app is used one-handed on a phone with floury hands — so that no later ticket has to
retrofit them.

This is the "make the change easy" step. Nothing user-visible ships beyond a clean starting
page.

## Acceptance criteria

- [x] The scaffold's demo routes and example spec are deleted, along with any assets only
      they referenced.
- [x] The root layout applies the base typography, colour and spacing the app will use, sized
      for a phone held one-handed, with generous tap targets as the default.
- [x] The viewport and theme metadata suit a full-screen mobile app.
- [x] The app builds as a prerendered static site — the adapter swap from ADR-0006 is already
      committed, so this ticket confirms prerendering is switched on and `pnpm build`
      succeeds.
- [x] `pnpm check`, `pnpm lint` and `pnpm test:unit` all pass.

## Comments

Resolved in `5a632c8`.

Two things the ticket did not anticipate:

- The ADR-0006 adapter swap was only half committed. `package.json` carried
  `@sveltejs/adapter-static`, but `vite.config.ts` still imported `@sveltejs/adapter-node`
  (this repo has no `svelte.config.js` — SvelteKit config lives in the `sveltekit()` plugin
  options). Fixed here, along with `src/routes/+layout.ts` switching prerendering on.
- `pnpm lint` was already failing on the committed docs and ADRs, which were not
  prettier-clean. Ran a one-off `pnpm format` over the repo so the gate is green from here.

Also removed: Playwright's config, dependency and scripts (out of scope per the PRD), the
`$lib/index.ts` placeholder, and the scaffold README. `test:unit` is now
`vitest --run --passWithNoTests` so it terminates while the suite is empty;
`test:unit:watch` keeps watch mode.

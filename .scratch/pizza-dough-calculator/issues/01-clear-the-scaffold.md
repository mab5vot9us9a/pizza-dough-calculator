# Clear the scaffold

Status: ready-for-agent
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

- [ ] The scaffold's demo routes and example spec are deleted, along with any assets only
      they referenced.
- [ ] The root layout applies the base typography, colour and spacing the app will use, sized
      for a phone held one-handed, with generous tap targets as the default.
- [ ] The viewport and theme metadata suit a full-screen mobile app.
- [ ] The app builds as a prerendered static site — the adapter swap from ADR-0006 is already
      committed, so this ticket confirms prerendering is switched on and `pnpm build`
      succeeds.
- [ ] `pnpm check`, `pnpm lint` and `pnpm test:unit` all pass.

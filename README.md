# pizza-calc

A mobile-first pizza dough calculator. Pick a style, say how many dough balls you want and how heavy
each should be, and get gram weights for every ingredient plus a proof schedule.

No accounts, no backend: the app is a prerendered static site and the whole recipe lives in the URL
(see `docs/adr/`).

## Working on it

```sh
pnpm install
pnpm dev        # dev server
pnpm build      # static build into ./build
pnpm preview    # serve the built site
```

Before committing:

```sh
pnpm check      # svelte-check
pnpm lint       # prettier + eslint  (pnpm format to fix)
pnpm test:unit  # vitest
```

CI runs exactly those three plus `pnpm build` on every pull request, so a red PR means one of them
fails locally too.

## Deploying

`main` deploys itself: CI gates it, then the static build is packaged into a Caddy image, pushed to
`ghcr.io/mab5vot9us9a/pizza-dough-calculator`, and pulled by Coolify. Rolling back means pointing
the Coolify resource's Tag at an earlier `sha-…` and redeploying.

The `Caddyfile` is not boilerplate — the cache headers it sets are what let a deploy reach an
already installed app. See `docs/deploy.md` for the runbook and `docs/adr/0007-*` for why.

## Orientation

- `CONTEXT.md` — the domain vocabulary.
- `docs/adr/` — the decisions behind the model, the ferment maths, persistence and deployment.
- `docs/deploy.md` — how a push to `main` becomes a live site.
- `src/lib/dough/` — the domain module: types, style presets and the solver.

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

## Orientation

- `CONTEXT.md` — the domain vocabulary.
- `docs/adr/` — the decisions behind the model, the ferment maths and the persistence approach.
- `src/lib/dough/` — the domain module: types, style presets and the solver.

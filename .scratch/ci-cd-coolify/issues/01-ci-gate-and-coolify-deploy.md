# CI gate and push-to-main deploy to Coolify

Status: ready-for-human

The repo had no CI and no deploy path: `pnpm check` / `pnpm lint` / `pnpm test:unit` were a manual
pre-commit ritual, and there was no way to get the built site onto the Coolify instance.

## What was done

- **Toolchain pinned** — `packageManager: pnpm@10.33.0`, `engines.node >=24`, `.nvmrc`. `.npmrc`
  already had `engine-strict=true` with no `engines` to enforce.
- **Duplicate prettier config resolved** — `.prettierrc` and `prettier.config.js` both existed and
  disagreed on `singleQuote`/`trailingComma`. Prettier resolves `.prettierrc` first, so
  `prettier.config.js` was dead; deleted, and its one unique setting (`tailwindStylesheet`) folded
  into `.prettierrc`. No reflow resulted.
- **`Dockerfile`** — `node:24-alpine` builds, `caddy:2-alpine` serves. 60 MB, no Node at runtime.
  Owns its `HEALTHCHECK`.
- **`Caddyfile`** — the cache-header split the service worker depends on, plus `try_files` standing
  in for the absent `404.html`.
- **`.github/workflows/ci.yml`** — check, lint, test, build; also `workflow_call`.
- **`.github/workflows/deploy.yml`** — gates on CI, pushes `latest` + `sha-<short>` to GHCR, POSTs
  Coolify's deploy endpoint.
- **Docs** — `docs/deploy.md` runbook, ADR-0007, README Deploy section. Corrected the "no git remote,
  no pull requests" premise in `docs/agents/issue-tracker.md`.

## Verified

Local gate green (svelte-check 0 errors, prettier+eslint clean, 67 tests, build ok). Image builds and
serves: `/`, `/service-worker.js`, `/manifest.webmanifest`, `/_app/version.json`, `/robots.txt` all
`no-cache`; `/_app/immutable/*` `max-age=31536000, immutable`; unknown path returns 200; container
reports `healthy`; every asset referenced by `index.html` and precached by the service worker
returns 200.

## Open — needs a human

- Coolify UI setup and the three repo secrets (`docs/deploy.md`, "One-time Coolify setup").
- Confirm the Coolify host is amd64 (`uname -m`). The published image is `linux/amd64`; an ARM host
  needs `docker/setup-qemu-action` and `platforms: linux/arm64`.
- Browser check of the service worker and offline mode was not run — the Chrome extension was not
  connected in the session that did this work.

## Comments

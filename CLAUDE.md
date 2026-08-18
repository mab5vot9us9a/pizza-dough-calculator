# CLAUDE.md

Guidance for Claude Code when working in the `pizza-calc` repo.

## Icons

Use @lucide/svelte for any icons.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/` in this repo. There is a remote and
CI runs on PRs, but PRs are a gate, not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` —
recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

## Deployment

`main` deploys itself: CI gates it, a Caddy image is built around `./build` and pushed to GHCR, and
Coolify pulls it. See `docs/deploy.md` and `docs/adr/0007-*`.

Two things not to "clean up" without reading ADR-0007 first:

- **`Caddyfile` cache headers.** `/_app/immutable/*` is immutable; everything else must stay
  `no-cache`. The service worker relies on this to reach already-installed apps. Collapsing the two
  `@immutable`/`@mutable` matchers into one matcher plus a bare `header` block silently breaks it —
  the unmatched block overwrites `Cache-Control`.
- **The Coolify resource is a Docker Image application, not Compose.** Only that build pack pulls on
  every redeploy.

Changes to the build, the adapter config in `vite.config.ts`, or `src/service-worker.ts` should be
checked against the local image verification steps at the end of `docs/deploy.md`.

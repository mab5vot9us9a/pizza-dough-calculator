# CLAUDE.md

Guidance for Claude Code when working in the `pizza-calc` repo.

## Icons

Use @lucide/svelte for any icons.

## Agent skills

### Issue tracker

Issues live as markdown files under `.scratch/<feature-slug>/` in this repo. No remote tracker; PRs
are not a triage surface. See `docs/agents/issue-tracker.md`.

### Triage labels

Default vocabulary — `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix` —
recorded as a `Status:` line in each issue file. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context: `CONTEXT.md` and `docs/adr/` at the repo root. See `docs/agents/domain.md`.

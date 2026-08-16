# Bake Time → clock times

Status: ready-for-agent
Type: task
Blocked by: Proof Schedule and the ferment model

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

A schedule of "2 h bulk, then 24 h fridge, then 2 h warm-up" is correct but not actionable.
The question a baker actually has is "it's Friday lunchtime, when do I need to start?"

Setting an optional Bake Time back-solves every Stage from the moment the user wants to be
eating, turning durations into real clock times. It stays optional: with nothing set the
schedule shows relative durations and remains true forever.

Bake Time is deliberately **never** encoded into shared links — ADR-0005 keeps links from
going stale. It is session-only.

## Acceptance criteria

- [ ] The user can set an optional target Bake Time, and clear it again.
- [ ] With a Bake Time set, every Stage in the Proof Schedule shows a real clock time,
      including the moment to start mixing.
- [ ] With no Bake Time set, the schedule shows relative durations and no dates appear
      anywhere.
- [ ] Clock times recompute when any Stage duration or the Bake Time changes.
- [ ] A schedule spanning more than a day shows enough date context to be unambiguous.
- [ ] Bake Time is not persisted into the URL.

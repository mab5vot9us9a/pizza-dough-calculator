# Lock the Leavening

Status: ready-for-agent
Type: task
Blocked by: Proof Schedule and the ferment model

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

Leavening and the Proof Schedule are two ends of one equation, and ADR-0003 says the user
chooses which end they drive. Until now the schedule has always driven. This ticket adds the
other direction: lock the Leavening — "I only have one sachet left" — and the schedule
re-solves to match.

Deriving a schedule from a Leavening quantity is underdetermined with more than one Stage,
so one Stage is designated Elastic and absorbs the whole change: the Cold Proof when there is
one, otherwise the Bulk. That fallback is not a nicety — the Same-day Style has no Cold Proof
at all, and without it locking Leavening there would have nothing to solve.

The point of the lock is that an unworkable combination becomes unreachable rather than
merely flagged, which is the app's answer to calculators that let you compute a dough that
blows out overnight.

## Acceptance criteria

- [ ] The user can lock either the Proof Schedule or the Leavening, and which one is locked
      is unmistakable on screen.
- [ ] With the schedule locked, Leavening derives from it, as before.
- [ ] With the Leavening locked, the Elastic Stage's duration derives from it and the rest
      of the schedule holds still.
- [ ] The Elastic Stage is the Cold Proof when present and the Bulk when not.
- [ ] A Leavening quantity high enough to over-ferment drives the Elastic Stage to zero,
      never to a negative duration.
- [ ] Adjusting the Leavening while it is locked visibly moves the Elastic Stage.
- [ ] Unit tests cover both directions of the solve, that locking each side in sequence
      round-trips to the original values, that the Elastic Stage falls back to the Bulk on
      the Same-day Style, and that the zero clamp holds.

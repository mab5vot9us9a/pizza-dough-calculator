# Lock the Leavening

Status: done
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

- [x] The user can lock either the Proof Schedule or the Leavening, and which one is locked
      is unmistakable on screen.
- [x] With the schedule locked, Leavening derives from it, as before.
- [x] With the Leavening locked, the Elastic Stage's duration derives from it and the rest
      of the schedule holds still.
- [x] The Elastic Stage is the Cold Proof when present and the Bulk when not.
- [x] A Leavening quantity high enough to over-ferment drives the Elastic Stage to zero,
      never to a negative duration.
- [x] Adjusting the Leavening while it is locked visibly moves the Elastic Stage.
- [x] Unit tests cover both directions of the solve, that locking each side in sequence
      round-trips to the original values, that the Elastic Stage falls back to the Bulk on
      the Same-day Style, and that the zero clamp holds.

## Resolution

`scheduleFor(schedule, freshYeastPercent)` in `ferment.ts` runs the model backwards, and
`solve()` calls it whenever `lock === "leavening"`. `SolvedRecipe` gained `elasticStage` so
the screen can say which Stage is giving way. The derived side of the relationship loses its
control and shows a locked readout in its place, so no number on screen is one the app is
about to overwrite.

Three things worth carrying forward.

**Flipping the Lock is a domain operation, not a UI one.** Iteration 4 left
`Recipe.freshYeastPercent` stale the moment the user flipped the Lock — the stored figure was
seeded from the Preset and never updated while the schedule drove. `withLock(recipe, lock)`
now writes whichever side is about to become derived with what the schedule or the yeast was
already asking for, so flipping changes nothing until the user moves something. It is
exported from the barrel and covered by a round-trip test over all five Styles.

**The Elastic Stage is read off the stored schedule, not the solved one.** Once too much
yeast has clamped the Cold Proof to zero, it is still the Stage giving way; deciding from the
solved schedule would hand the role to the Bulk and start shrinking that too.

**Handing the Elastic role over needs the on-screen value banked first.** Because the role
depends on whether there is a Cold Proof, raising a zeroed one takes it back from the Bulk —
and the Bulk becomes an input again holding whatever was stored before the Lock, not what it
was showing a moment ago. `setStageHours` in the Workbench banks the solved Elastic duration
into the Recipe before any other duration changes around it. This is a UI-level seam and is
not covered by a test; the PRD names only the solver and the URL codec as test seams.

Yeast's fresh/dry conversion moved into `src/lib/dough/yeast.ts` on its fourth appearance,
as the last three iterations kept noting it should.

# Bake Time → clock times

Status: done
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

- [x] The user can set an optional target Bake Time, and clear it again.
- [x] With a Bake Time set, every Stage in the Proof Schedule shows a real clock time,
      including the moment to start mixing.
- [x] With no Bake Time set, the schedule shows relative durations and no dates appear
      anywhere.
- [x] Clock times recompute when any Stage duration or the Bake Time changes.
- [x] A schedule spanning more than a day shows enough date context to be unambiguous.
- [x] Bake Time is not persisted into the URL.

## Resolution

`src/lib/bake-time.ts` holds the whole feature's computation: `clockTimes(schedule, bakeTime)`
counts the Proof Schedule back from the bake so the last Stage ends exactly when the pizza
goes in, and `formatClockTime(at, bakeTime)` prints a moment with just enough date on it. The
Workbench gained an "Eating at" `datetime-local` field with a clear button, and the schedule
list gained a leading "Mix" line and a clock time under every entry.

Three things worth carrying forward.

**Bake Time is not part of the Recipe.** It is a `$state` string local to the Workbench. That
is the enforcement of "never encoded into a shared link" (ADR-0005) rather than a note asking
a later ticket to remember: the codec in Issue 08 encodes a `Recipe`, and a Bake Time is not
in one to be encoded. It also means the field is genuinely session-only — leaving the
workbench for the Style picker clears it.

**Calendar arithmetic is not fermentation arithmetic.** The module sits beside `format.ts`,
not inside `src/lib/dough/`, because the dough module's whole computational interface is
`solve()` (PRD, Domain module) and nothing about counting hours on a clock belongs behind it.

**Date context escalates in three steps.** Bare time on the day of the bake, weekday prefix on
any other day, and a full date once the entry is six or more days from the bake — the point at
which a weekday name starts to be ambiguous. A 48 h Cold Proof therefore reads "Fri 14:00",
and a week-long ferment reads "Sat 8 Aug, 14:00".

**A third test seam, deliberately.** The PRD names the solver and the URL codec as the only
tested seams. `bake-time.test.ts` adds a sixth-of-a-page suite anyway, because the failure
modes here — a Stage of zero hours, an Elastic Stage solved to 23.42 h, midnight and
week-boundary rounding — are silent and arithmetic, exactly the kind the PRD's two seams
exist to catch elsewhere. It is a pure module tested through its public surface, not a
component test; the exclusions the PRD actually lists (component, localStorage, service
worker, Playwright) are all untouched.

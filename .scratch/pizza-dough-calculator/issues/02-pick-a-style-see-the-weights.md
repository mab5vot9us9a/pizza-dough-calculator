# Pick a Style, see the weights

Status: done
Type: task
Blocked by: Clear the scaffold

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

The tracer bullet — a complete path from domain to screen. A user lands on the app, chooses
one of five Styles, says how many Dough Balls they want and what each should weigh, and reads
exact gram weights for every ingredient.

Leavening is **not** solved in this ticket. Each Preset carries a literal yeast percentage
that the solver treats like any other ingredient; ticket "Proof Schedule and the ferment
model" replaces it with the real model. This keeps the Anchor arithmetic testable on its own.

The Anchor rule from ADR-0001 is the heart of it: Total Dough Weight is what the user asked
for, and flour is solved backwards from it. The rounding rule matters just as much — a column
of weights that doesn't add up to the stated total reads as a bug.

## Acceptance criteria

- [x] All five Style Presets exist with the values from the spec's table, including a literal
      yeast percentage as a placeholder.
- [x] `solve()` returns gram weights for flour, water, salt, oil, sugar and yeast, plus the
      Baker's Percentages they came from.
- [x] Flour is solved backwards from the Total Dough Weight; the Total Dough Weight is
      unaffected by any percentage change.
- [~] Flour and water are presented to the gram, salt, oil, sugar and yeast to a tenth of a
      gram, with full precision retained internally. **Water yes, flour no** — see the
      resolution below.
- [x] Flour absorbs the rounding drift so the displayed weights sum exactly to the Total
      Dough Weight.
- [x] A Style picker screen lists the five Styles with their names and short descriptions.
- [x] Choosing a Style opens the workbench, pre-filled with that Style's default Batch.
- [x] Dough Ball count and weight are adjustable, and the Total Dough Weight is shown.
- [x] The solved weights sit in a sticky header so they stay visible while the page scrolls.
- [x] Oil and sugar rows do not render for Styles whose Preset sets them to zero.
- [x] Unit tests cover the Anchor rule, the summing rule across all five Styles, and awkward
      Batch sizes where rounding drift is largest.

## Resolution

Two acceptance criteria contradict each other. Flour cannot be whole while also absorbing
the drift: the tenths the small ingredients round away have to land somewhere. Neapolitan is
the smallest example — water 375 g + salt 16.9 g + yeast 4.5 g leaves flour at 603.6 g, and
rounding that to 604 g makes four 250 g balls read as 1000.4 g.

Exact summing was kept, on the ticket's own ranking: "a column of weights that doesn't add up
to the stated total reads as a bug". So flour is the one weight that can show a tenth. It is
pinned by a named test and commented at the rounding site.

Worth a second opinion when the display work lands — putting the tenth on water instead would
be a one-line change, and either way one of the two rules gives.

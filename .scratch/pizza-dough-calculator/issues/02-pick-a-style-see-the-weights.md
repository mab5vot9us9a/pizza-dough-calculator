# Pick a Style, see the weights

Status: ready-for-agent
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

- [ ] All five Style Presets exist with the values from the spec's table, including a literal
      yeast percentage as a placeholder.
- [ ] `solve()` returns gram weights for flour, water, salt, oil, sugar and yeast, plus the
      Baker's Percentages they came from.
- [ ] Flour is solved backwards from the Total Dough Weight; the Total Dough Weight is
      unaffected by any percentage change.
- [ ] Flour and water are presented to the gram, salt, oil, sugar and yeast to a tenth of a
      gram, with full precision retained internally.
- [ ] Flour absorbs the rounding drift so the displayed weights sum exactly to the Total
      Dough Weight.
- [ ] A Style picker screen lists the five Styles with their names and short descriptions.
- [ ] Choosing a Style opens the workbench, pre-filled with that Style's default Batch.
- [ ] Dough Ball count and weight are adjustable, and the Total Dough Weight is shown.
- [ ] The solved weights sit in a sticky header so they stay visible while the page scrolls.
- [ ] Oil and sugar rows do not render for Styles whose Preset sets them to zero.
- [ ] Unit tests cover the Anchor rule, the summing rule across all five Styles, and awkward
      Batch sizes where rounding drift is largest.

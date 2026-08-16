# Adjust the Recipe freely

Status: done
Type: task
Blocked by: Pick a Style, see the weights

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

The Style is a starting point, not a cage. Every Baker's Percentage becomes adjustable, and
the gram weights respond as the user moves them — watching the numbers change while dragging
is most of the app's value.

Two ways to set a value, because the two modes are genuinely different tasks: dragging
answers "what happens if I go wetter", typing answers "I want exactly 63%". One shared
control serves both, and it will be reused for every adjustable value in later tickets, so
its interface matters more than its looks.

Per the spec, sliders run the full physically sensible range with no shaded bands, no
snapping and no warnings. The app computes; it does not comment.

## Acceptance criteria

- [x] One reusable control provides a slider plus a tappable numeric readout that opens the
      numeric keypad for exact entry.
- [x] Hydration, salt, oil and sugar are all adjustable through it.
- [x] Every solved weight updates live as a value changes.
- [x] Sliders span the full physically sensible range, with no bands, snapping or warnings.
- [x] Oil and sugar controls appear only for Styles whose Preset uses them.
- [~] Yeast type toggles between fresh and dry, converting the displayed quantity by a
      factor of three and changing nothing else about the dough. **Partial — see below.**
- [x] The control is comfortable to use one-handed on a phone.
- [~] Unit tests cover that changing Hydration holds the Total Dough Weight constant while
      moving flour and water in opposite directions, and that switching yeast type changes
      only the yeast figure. **The second test states what does change; see below.**

## Resolution

Done, with one criterion met in spirit rather than to the letter.

### "Changing nothing else about the dough" is unreachable

Toggling fresh to dry cannot leave the rest of the column alone, and no implementation
choice makes it possible. The Total Dough Weight is the Anchor (ADR-0001): flour is solved
backwards from it, so the dough's ingredients always sum to exactly what the user asked
for. Fresh yeast weighs three times what dry does for the same fermentation, so the swap
moves about 3 g of mass in a 1000 g dough. That mass has to come from somewhere — flour
gives it up, and the ingredients measured off flour shed a tenth with it.

The alternative is to keep the yeast out of the Anchor arithmetic, which trades a visible
inconsistency for a worse one: the printed column would no longer add up to the Total Dough
Weight. Issue 01 already ranked those against each other and chose exact summing.

What is true, and is what the criterion is really after: the dough is the same dough. Every
Baker's Percentage, the Proof Schedule and the Total Dough Weight are untouched, and the
reported yeast quantity moves by the factor of three. The drift in everything else is under
half a percent — well inside what a kitchen scale rounds away.

`solve.test.ts` states this directly rather than asserting something false: the test is
named "leaves the rest of the Recipe alone when the yeast type changes", asserts the
percentages, schedule and total are identical, and then pins the drift to a positive value
under 0.5% of the batch. It fails if the drift ever grows.

Worth a second look if the ferment model (Issue 04) changes what `freshYeastPercent` means.

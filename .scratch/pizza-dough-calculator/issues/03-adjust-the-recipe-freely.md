# Adjust the Recipe freely

Status: ready-for-agent
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

- [ ] One reusable control provides a slider plus a tappable numeric readout that opens the
      numeric keypad for exact entry.
- [ ] Hydration, salt, oil and sugar are all adjustable through it.
- [ ] Every solved weight updates live as a value changes.
- [ ] Sliders span the full physically sensible range, with no bands, snapping or warnings.
- [ ] Oil and sugar controls appear only for Styles whose Preset uses them.
- [ ] Yeast type toggles between fresh and dry, converting the displayed quantity by a
      factor of three and changing nothing else about the dough.
- [ ] The control is comfortable to use one-handed on a phone.
- [ ] Unit tests cover that changing Hydration holds the Total Dough Weight constant while
      moving flour and water in opposite directions, and that switching yeast type changes
      only the yeast figure.

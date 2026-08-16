# Sourdough is deferred, and the model is deliberately not shaped for it

Sourdough was in the original list of Styles and has been dropped from v1. We also
considered modelling Leavening as a discriminated union up front, with only the yeast
variants implemented, so that a starter could be added later without touching the solver.
We decided against it: v1 stays flat and straight-line, and the refactor is accepted as a
known future cost.

## Consequences

A sourdough starter is not a seasoning — at 100% hydration, 116 g of starter is 58 g flour
and 58 g water, and both must land in the totals or the displayed Hydration is wrong. That
forces a distinction a yeast-only app never needs: what the dough *is* made of versus what
you *add to the bowl*. Introducing it later means reworking the solver's output, the
display, and the shared-link format together. This was a deliberate choice, not an
oversight — do not treat the flat model as an accident to be tidied up.

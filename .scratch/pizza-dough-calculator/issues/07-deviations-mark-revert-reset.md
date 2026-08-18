# Deviations: mark, revert, reset

Status: resolved
Type: task
Blocked by: Proof Schedule and the ferment model

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

The Style stays a reference point after the user has adjusted things. Values moved away from
their Preset are Deviations: marked, showing what they used to be, and revertible one at a
time. There is also a global reset back to the Style.

Per-field revert matters most on a phone. It is easy to fat-finger a slider, and without it
the only recovery is starting the whole dough over.

Deviations are **derived** by comparing the Recipe against its Style's Preset, not stored as
flags. That keeps the persisted shape small — which the persistence ticket depends on — and
makes reverting a field a copy from the Preset.

## Acceptance criteria

- [x] Any value differing from its Preset is visibly marked as changed.
- [x] A changed value shows what its Preset value was.
- [x] Each changed value can be reverted individually.
- [x] A single action resets the entire Recipe to its Style's Preset.
- [x] A Recipe with any Deviation reads as "modified" alongside its Style name.
- [x] Deviations are derived from a comparison against the Preset, not stored on the Recipe.
- [x] Batch, percentages, yeast type and every Proof Schedule value all participate.

## Resolution

`src/lib/dough/deviations.ts` holds the comparison: `deviationsOf(recipe)` returns the
Preset's value for every field the Recipe no longer agrees with it about, `isModified` is
that set being non-empty, `revert(recipe, field)` copies one value back out of the Preset and
`resetToPreset(recipe)` starts the Style again. One table of thirteen fields — one per
adjustment the app offers — carries how each is read, what the Preset says and how to put it
back, so a new adjustment is a new row rather than a new comparison.

`RevertChip.svelte` is the mark and the way back in one control: it is only present when the
value has moved, it says what the Style asked for, and tapping it reverts. `AdjustableValue`
renders it beside its label, so every slider in the app got per-field revert at once; the
Batch steppers and the yeast type carry their own. The sticky header gained a "modified" pill
beside the Style name and a Reset button, both appearing only when there is something to say.

Three things worth carrying forward.

**The derived side of the Lock is never a Deviation.** With the Proof Schedule locked the
Leavening is an answer, so it is not marked no matter what the schedule does to it; with the
Leavening locked the Elastic Stage's hours are the answer, so they are not marked either. The
review caught the second case: the screen banks the Elastic Stage's solved duration into the
Recipe as the baker moves the Stages around it, and marking that figure left the Recipe
reading "modified" about a fractional Cold Proof nobody chose and no control could revert.
Both exemptions are the same rule read from the two ends of ADR-0003, and both are pinned by
tests that assert the mark comes back the moment the Lock hands that side over to the baker.

**A Preset carries no Leavening figure**, so the comparison derives one with the ferment
model. That keeps `Style` free of a number that would then exist in two places, at the price
of the Deviations module knowing the model exists.

**The Warm-up temperature has no field of its own**, because it has no control of its own — it
follows the room, and reverting the room temperature restores both Stages. A Recipe arriving
from Issue 08's URL hash with a Warm-up temperature that diverges from its Bulk will therefore
neither mark nor revert it. Worth revisiting if a decoded Recipe can ever hold that state.

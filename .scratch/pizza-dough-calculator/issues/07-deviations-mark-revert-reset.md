# Deviations: mark, revert, reset

Status: ready-for-agent
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

- [ ] Any value differing from its Preset is visibly marked as changed.
- [ ] A changed value shows what its Preset value was.
- [ ] Each changed value can be reverted individually.
- [ ] A single action resets the entire Recipe to its Style's Preset.
- [ ] A Recipe with any Deviation reads as "modified" alongside its Style name.
- [ ] Deviations are derived from a comparison against the Preset, not stored on the Recipe.
- [ ] Batch, percentages, yeast type and every Proof Schedule value all participate.

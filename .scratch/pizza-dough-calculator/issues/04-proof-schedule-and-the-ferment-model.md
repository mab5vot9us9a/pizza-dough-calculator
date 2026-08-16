# Proof Schedule and the ferment model

Status: ready-for-agent
Type: task
Blocked by: Adjust the Recipe freely

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

The part recipes never explain: how much yeast for a given proofing time and kitchen
temperature. The literal yeast percentage from the tracer bullet is replaced by the real
model, and the Proof Schedule becomes visible and adjustable.

The model is the Q10 rate law recorded in ADR-0002 — each Stage contributes
`hours × 3^((celsius − 20) / 10)` of Activity, and a Recipe is correctly leavened when
`freshYeastPercent × activity = 6`. Leavening is held internally as fresh-yeast percentage
whatever the user's chosen type, so the model has one unit.

Temperature is not decoration here. At Q10 = 3 the difference between an 18 °C February
kitchen and a 26 °C August one more than doubles the fermentation rate, so both room and
fridge temperatures are adjustable.

Note that the constants are the acknowledged soft spot — they were fitted by hand against
three of five Styles, and there is deliberately no calibration test harness.

## Acceptance criteria

- [ ] Activity is computed across all Stages using the Q10 rate law from ADR-0002.
- [ ] The Leavening quantity is derived from the Proof Schedule and replaces the placeholder
      percentage in every Preset.
- [ ] The Proof Schedule renders as an ordered list of steps with durations and temperatures,
      followed by the Style's bake instruction.
- [ ] Bulk, Cold Proof and Warm-up durations are all adjustable.
- [ ] Room and fridge temperatures are both adjustable.
- [ ] A Stage with a zero duration is treated as absent, not as a special case — the Same-day
      Style has no Cold Proof and no Warm-up, and its schedule reads correctly.
- [ ] Every solved weight and the Leavening quantity update live as the schedule changes.
- [ ] The adjustment control from the previous ticket is reused for durations and
      temperatures.
- [ ] Unit tests cover that each Style's Preset schedule yields a plausible Leavening
      quantity, and that raising the room temperature reduces the Leavening required.

# Proof Schedule and the ferment model

Status: done
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

- [x] Activity is computed across all Stages using the Q10 rate law from ADR-0002.
- [x] The Leavening quantity is derived from the Proof Schedule and replaces the placeholder
      percentage in every Preset.
- [x] The Proof Schedule renders as an ordered list of steps with durations and temperatures,
      followed by the Style's bake instruction.
- [x] Bulk, Cold Proof and Warm-up durations are all adjustable.
- [x] Room and fridge temperatures are both adjustable.
- [x] A Stage with a zero duration is treated as absent, not as a special case — the Same-day
      Style has no Cold Proof and no Warm-up, and its schedule reads correctly.
- [x] Every solved weight and the Leavening quantity update live as the schedule changes.
- [x] The adjustment control from the previous ticket is reused for durations and
      temperatures.
- [x] Unit tests cover that each Style's Preset schedule yields a plausible Leavening
      quantity, and that raising the room temperature reduces the Leavening required.

## Resolution

Done. Every criterion met to the letter; two decisions worth recording.

### The Warm-up has no temperature of its own

The model gives every Stage its own temperature, but the user gets one "Room temp" control
that writes both the Bulk's and the Warm-up's. They happen on the same worktop, and a
February kitchen is cold for both — offering two controls would invite the user to state a
contradiction and answer a question they never asked. The Cold Proof keeps its own "Fridge
temp", because a wine fridge and a cold garage really are different places. The criterion
asks for room and fridge temperatures to be adjustable, and both are.

### Zero Activity reports no Leavening

Every duration can be dragged to zero, so a schedule with no proofing time at all is
reachable. `6 ÷ 0` is an infinity that would propagate into the Anchor arithmetic and empty
the whole column, so `leaveningFor` reports zero instead. This is not the app commenting on
an unbakeable dough — it stays silent, as the PRD requires — it is the one place the model
has no answer, and zero is the honest reading of "no proofing time, no fermentation".

### The tests do not know the constants

ADR-0002 expects Q10 and K to be retuned, and the PRD forbids tests that would have to be
rewritten when they are. So the Preset coverage asserts a band a baker would recognise —
between 0.2% and 2% fresh yeast — rather than the figures the current constants produce,
and the rest assert directions: warmer needs less, longer needs less, and an hour in the
fridge is worth less than an hour on the worktop. The band is still tight enough to fail if
the constants move by the threefold that Q10 = 2 would have cost.

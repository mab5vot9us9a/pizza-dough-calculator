# Fermentation is modelled as a Q10 rate law

Leavening quantity and Proof Schedule are two ends of one relationship, so the app needs a function
relating them. We use a Q10 rate law: each Stage contributes `hours × 3^((T − 20) / 10)` of
Activity, and a Recipe is correctly leavened when `leavening% × activity = 6` (leavening expressed
as fresh yeast). It is a pure, invertible function of about fifteen lines, solvable in either
direction, and explainable to a user in one sentence.

## Considered Options

Interpolating published yeast/time/temperature tables would be more faithful to what experienced
bakers trust, but it is a large amount of data to source, awkward to interpolate across two axes,
and impossible to explain. Per-style calibrated curves would be more accurate within each Style but
offer no principled behaviour once the user deviates from a Preset — which is the whole point of the
app.

## Consequences

The constants are the risky part, not the equation. A Q10 of 2 — the textbook default — was tried
first and under-predicts leavening by three- to six-fold, because it treats a fridge as far more
active than it really is; 3 fits known-good recipes across a 5-hour room-temperature dough and a
48-hour cold one. Both constants were fitted by hand against three Styles and are not covered by
tests, so treat them as the first thing to suspect if predictions drift.

# Total Dough Weight is the anchor

The user states a Batch (four balls of 250 g) before adjusting anything else, so the Total Dough
Weight is a promise the app has already made. We solve flour backwards from it —
`flour = total ÷ (1 + hydration + salt + oil + sugar + leavening)` — rather than treating flour as
fixed and letting the dough grow as water is added.

## Considered Options

Anchoring on flour weight is how a paper recipe scales, and it is what most published dough formulas
imply. We rejected it because raising hydration would then silently turn four 250 g balls into four
262 g balls, breaking the promise the first screen made.

## Consequences

Every ingredient percentage sits in the solver's denominator, so adding a new ingredient (oil,
sugar, and later a sourdough starter) changes the flour figure and is not merely an extra line of
output.

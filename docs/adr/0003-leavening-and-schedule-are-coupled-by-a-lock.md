# Leavening and Proof Schedule are coupled by a Lock

Both Leavening and proofing times must be adjustable, but they are physically two ends of one
equation — left independent, the app would let a user compute a dough that blows out overnight.
Instead the user chooses which side they drive: lock the Proof Schedule and the Leavening is
derived, or lock the Leavening ("I only have 7 g of dry yeast left") and the Proof Schedule is
derived. A wrong combination is unreachable rather than merely warned about.

## Consequences

Deriving a Proof Schedule from a Leavening quantity is underdetermined when there is more than one
Stage, so one Stage is designated Elastic and absorbs the whole change: the Cold Proof if there is
one, otherwise the Bulk. The fallback matters — the Same-day Style has no Cold Proof at all, and
without it locking Leavening there would have nothing to solve.

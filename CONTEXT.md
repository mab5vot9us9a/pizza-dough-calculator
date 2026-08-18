# Pizza Dough

A calculator for pizza dough. The user names the pizzas they want to end up with, picks a style to
start from, and adjusts freely from there; the app solves the ingredient weights and the proofing
schedule to match.

## Language

### The dough

**Recipe**: The working definition of a dough — its ingredient proportions plus its Proof Schedule.
_Avoid_: formula, dough, bake

**Baker's Percentage**: An ingredient's weight expressed as a proportion of the total flour weight,
where flour is 100%. Every ingredient except flour is stated this way. _Avoid_: ratio, baker's math,
percentage

**Hydration**: Water as a Baker's Percentage. _Avoid_: water ratio, wetness, moisture

**Dough Ball**: One portion of dough, enough for a single pizza. _Avoid_: portion, panetto, piece

**Batch**: How many Dough Balls are wanted and what each should weigh. _Avoid_: yield, quantity,
serving

**Total Dough Weight**: Dough Ball count multiplied by Dough Ball weight. The weight of everything
in the bowl. _Avoid_: batch weight, total weight

**Anchor**: The quantity held fixed while every other weight is solved backwards from it. Here it is
always the Total Dough Weight — the user gets exactly the pizzas they asked for. _Avoid_: base,
target, constraint

**Leavening**: The raising agent and its quantity. Currently fresh yeast or instant dry yeast, which
differ by a factor of three; a sourdough starter is a future variant. _Avoid_: yeast (when meaning
the general concept), raising agent, barm

### Time and temperature

**Proof Schedule**: The ordered Stages a dough passes through between mixing and baking. _Avoid_:
timeline, plan, programme, itinerary

**Stage**: One segment of a Proof Schedule, with a duration and a temperature. Bulk, Cold Proof and
Warm-up are the Stages in use. _Avoid_: step, phase, period

**Activity**: A single temperature-weighted measure of how much fermentation a whole Proof Schedule
delivers, so that Stages at different temperatures can be added together. More Leavening or more
Activity both mean a more fermented dough. _Avoid_: fermentation units, work, progress

**Elastic Stage**: The Stage whose duration changes when the Proof Schedule has to be re-solved. The
Cold Proof if there is one, otherwise the Bulk. _Avoid_: flexible stage, variable stage

**Bake Time**: An optional wall-clock time the user wants to be eating at. Setting it turns the
Proof Schedule's durations into real clock times. _Avoid_: deadline, serve time, target time

### Choosing and adjusting

**Style**: A named kind of pizza dough — Neapolitan, New York, Deep Dish, Sheet Pan, Same-day. What
the user picks first, and what a Recipe remains identified by. _Avoid_: type, variety, kind

**Preset**: The starting values a Style seeds a Recipe with. A Style is an identity; its Preset is
the numbers behind it. _Avoid_: template, default recipe, base recipe

**Deviation**: A value the user has moved away from its Preset. Deviations are marked, individually
revertible, and are what makes a Recipe "modified". _Avoid_: override, change, edit, customisation

**Lock**: Which side of the Leavening-to-Proof-Schedule relationship the user is driving. Lock the
schedule and the Leavening is solved; lock the Leavening and the Elastic Stage is solved. _Avoid_:
pin, freeze, hold

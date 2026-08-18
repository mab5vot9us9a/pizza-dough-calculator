# Pizza Dough Calculator — v1

Status: ready-for-agent
Type: task

## Problem Statement

Someone who wants to make pizza at home has to work out their dough from a recipe written
for a batch size that isn't theirs. Every published recipe fixes both the quantity and the
style: four balls at 250 g, 62% Hydration, a fixed overnight proof. Wanting six balls, or a
wetter dough, or to bake on Saturday evening instead of Friday, means doing Baker's
Percentage arithmetic by hand — and the hardest part, how much yeast to use for a given
proofing time and kitchen temperature, is the part recipes never explain. Get it wrong and
the dough is flat or blown out, and you find out eighteen hours later.

Existing calculators mostly convert percentages to grams and stop there. They leave
Leavening and time as two unrelated inputs, which means they will happily produce a
combination that cannot work.

The user wants to open something on their phone in the kitchen, say what they want to end
up with, and get numbers they can act on.

## Solution

A mobile-first web app with no signup. The user lands on the page and picks a Style. They
say how many Dough Balls they want and what each should weigh. They immediately see exact
gram weights for every ingredient and a Proof Schedule telling them when to do what.

From there everything is adjustable — Hydration, salt, oil, sugar, yeast type, proofing
times, proofing temperatures. The Style they picked is a starting point, not a cage:
adjusted values are marked as Deviations and can be reverted individually or all at once.

Leavening and the Proof Schedule are treated as two ends of one relationship rather than
two independent numbers. The user locks whichever side they care about — "I want to bake
Saturday at six" or "I only have one sachet left" — and the app solves the other. A
combination that cannot work is unreachable rather than merely flagged.

Nothing is stored on a server. Returning to the page restores the last session. Bookmarking
or sharing the link saves the Recipe, because the whole Recipe lives in the URL. Installed
to the home screen, it works with no connection at all.

## User Stories

### Getting started

1. As a first-time visitor, I want to use the app the moment it loads, so that I don't have
   to create an account to answer a five-second question.
2. As a first-time visitor, I want to choose from a small list of named pizza Styles, so
   that I can start from something known-good rather than a blank form.
3. As a first-time visitor, I want each Style to carry a short description, so that I can
   tell Sheet Pan from Deep Dish without already being an expert.
4. As a user who has picked a Style, I want its typical Batch pre-filled, so that I get a
   plausible result before I have adjusted anything.
5. As a returning user, I want to land straight on the dough I was last working on, so that
   I don't repeat the setup every time.
6. As a returning user, I want to get back to the Style list deliberately, so that I can
   start a different dough when I want to.

### Saying what I want to end up with

7. As a user, I want to set how many Dough Balls I want, so that the recipe matches the
   number of people I'm feeding.
8. As a user, I want to set what each Dough Ball weighs, so that I can make personal pizzas
   or large ones.
9. As a user, I want to see the Total Dough Weight, so that I can sanity-check the batch
   against my mixing bowl.
10. As a user, I want the Dough Ball count and weight I asked for to be exactly what I get,
    so that changing Hydration never silently changes my portion size.
11. As a user, I want all weights in grams, so that I can use them directly on a kitchen
    scale.

### Adjusting the Recipe

12. As a user, I want to adjust Hydration, so that I can make a wetter or drier dough than
    the Style's default.
13. As a user, I want to adjust salt, so that I can suit my own taste.
14. As a user, I want to adjust oil and sugar on Styles that use them, so that I can tune
    richness and browning.
15. As a user, I want oil and sugar to be absent from Styles that don't use them, so that a
    Neapolitan screen isn't cluttered with ingredients that shouldn't be in it.
16. As a user, I want to drag a slider to change a value, so that I can explore quickly and
    watch the grams respond.
17. As a user, I want to tap a number and type an exact value, so that I can hit 63%
    precisely instead of fighting a slider with my thumb.
18. As a user, I want every gram weight to update immediately as I adjust, so that I can
    see the consequence of a change while making it.
19. As a user, I want to be able to set any physically sensible value, so that the app
    never argues with me about what I'm trying to make.

### Leavening

20. As a user, I want to choose between fresh yeast and dry yeast, so that I can use
    whichever I have in the house.
21. As a user, I want the quantity to convert correctly when I switch yeast type, so that
    the dough behaves the same either way.
22. As a user, I want to see the yeast quantity to a tenth of a gram, so that small
    quantities are still actionable.

### Proofing and time

23. As a user, I want to set how long the dough proofs at room temperature, so that the
    schedule fits my day.
24. As a user, I want to set how long the dough proofs in the fridge, so that I can make it
    the day before.
25. As a user, I want to set the room temperature, so that the app is right in a cold
    February kitchen as well as a hot August one.
26. As a user, I want to set the fridge temperature, so that a cold garage or a wine fridge
    is accounted for.
27. As a user, I want the Leavening quantity to update when I change the Proof Schedule, so
    that the two are always consistent.
28. As a user, I want to lock the Leavening quantity instead, so that I can plan around the
    yeast I actually have.
29. As a user, I want the Proof Schedule to adjust when I lock the Leavening, so that the
    dough still comes out right.
30. As a user, I want to see clearly which side is locked, so that I know which number the
    app is going to change when I move something.
31. As a user, I want the Proof Schedule shown as an ordered list of steps with durations,
    so that I know what to do and in what order.
32. As a user, I want to optionally set the time I want to be eating, so that the app tells
    me when to start mixing.
33. As a user, I want each step to show a real clock time once I've set a Bake Time, so
    that I don't have to do the arithmetic myself.
34. As a user, I want the schedule to work with no Bake Time set, so that I can plan in the
    abstract.
35. As a user, I want to see the recommended oven temperature and bake time for the Style,
    so that the schedule takes me all the way to a finished pizza.

### Deviations from the Preset

36. As a user, I want to see which values I've changed from the Style's Preset, so that I
    can tell my own choices from the defaults.
37. As a user, I want to see what a changed value used to be, so that I have a reference
    point for how far I've strayed.
38. As a user, I want to revert a single changed value, so that I can undo one bad drag
    without losing everything else.
39. As a user, I want to reset the whole Recipe back to its Style's Preset, so that I can
    start over without leaving the screen.
40. As a user, I want to see that my Recipe is "modified", so that I understand it is no
    longer exactly the named Style.

### Reading the result

41. As a user, I want the ingredient weights visible while I adjust, so that I never have
    to scroll away from the answer to change an input.
42. As a user, I want flour and water rounded to the gram, so that the numbers match what
    my scale can read.
43. As a user, I want salt, oil, sugar and yeast to a tenth of a gram, so that small
    quantities are not rounded into uselessness.
44. As a user, I want the displayed ingredient weights to add up exactly to the Total Dough
    Weight, so that the numbers don't look like an arithmetic error.
45. As a user, I want to see each ingredient's Baker's Percentage alongside its weight, so
    that I can compare the Recipe to others written that way.

### Keeping and sharing

46. As a user, I want my current dough to still be there when I come back, so that I don't
    lose my work by closing the tab.
47. As a user, I want to bookmark a Recipe, so that I can return to a dough I liked.
48. As a user, I want to send a Recipe to someone as a link, so that they get exactly my
    dough without me retyping it.
49. As a user opening someone's link, I want to see their Recipe, so that the link does
    what it obviously should.
50. As a user opening someone's link, I want my own in-progress dough not to be destroyed
    unless I start editing, so that a stray tap doesn't cost me my work.
51. As a user, I want a shared link to still be correct next week, so that links don't rot.

### In the kitchen

52. As a user, I want to add the app to my home screen, so that it opens like an app
    without browser chrome.
53. As a user, I want the app to work with no connection, so that bad kitchen wifi doesn't
    lock me out mid-bake.
54. As a user, I want my saved session to survive weeks of not opening the app, so that my
    dough is still there next time I make pizza.
55. As a user with floury hands, I want large tap targets, so that I can use it without
    precision.
56. As a user, I want the whole thing to work one-handed on a phone, so that I can hold a
    dough scraper in the other.

## Implementation Decisions

### Domain module

A single dough module owns the entire domain, exposing types, the Style Presets, and one
solver. It has no dependency on Svelte, the browser, or storage — it is pure TypeScript, so
it can be exercised entirely through its public surface.

**The solver is the module's whole interface for computation.** `solve(recipe)` takes a
Recipe and returns a `SolvedRecipe` — gram weights for every ingredient, the resolved Proof
Schedule, and the Baker's Percentages they came from. The Anchor arithmetic, the ferment
model, Lock resolution and rounding all live behind it and are not separately exported.
This is deliberate: ADR-0002 records that the ferment constants are the most likely thing
to change, so nothing outside the module should be able to reach them.

The type shape, already committed, is the precise statement of the model:

```ts
interface Recipe {
	styleId: StyleId;
	batch: { count: number; ballGrams: number };
	percentages: { hydration: number; salt: number; oil: number; sugar: number };
	yeastType: "fresh" | "dry";
	schedule: { bulk: Stage; cold: Stage; warmUp: Stage }; // Stage = { hours, celsius }
	lock: "schedule" | "leavening";
	freshYeastPercent: number; // meaningful only when lock === "leavening"
}
```

Leavening is stored internally as a percentage of fresh yeast regardless of the user's
chosen yeast type, so the ferment model has one unit and the display layer converts. A
Stage with `hours: 0` is absent rather than a special case — this is how the Same-day Style
expresses "no Cold Proof".

### Solver behaviour

- **Anchor.** Total Dough Weight is `count × ballGrams`. Flour is
  `total ÷ (1 + hydration + salt + oil + sugar + leavening)`, all as Baker's Percentages.
  Every other ingredient is a percentage of the resulting flour weight. Per ADR-0001.
- **Ferment model.** Activity is `Σ hours × 3^((celsius − 20) / 10)` across all Stages;
  a Recipe is correctly leavened when `freshYeastPercent × activity = 6`. Per ADR-0002.
- **Lock.** With `lock: "schedule"`, leavening is `6 ÷ activity`. With `lock: "leavening"`,
  the required activity is `6 ÷ freshYeastPercent` and the Elastic Stage's duration absorbs
  the difference. Per ADR-0003.
- **Elastic Stage.** The Cold Proof when it is present, otherwise the Bulk. Its solved
  duration is clamped to a non-negative value; when the requested Leavening is so high that
  even a zero-length Elastic Stage over-ferments, the Stage goes to zero rather than
  negative.
- **Rounding.** Full precision internally. Flour and water are presented to the gram, salt,
  oil, sugar and yeast to a tenth. Flour absorbs the accumulated rounding drift so the
  displayed column sums exactly to the Total Dough Weight.
- **Yeast type.** Fresh is three times dry by weight. The solver reports the quantity in
  the Recipe's chosen type.

### Styles

Five Styles ship: Neapolitan, New York, Deep Dish, Sheet Pan (Roman *teglia*) and Same-day.
Each Preset carries a default Batch, its Baker's Percentages, its yeast type, its Proof
Schedule and a bake instruction string. Neapolitan has zero oil and zero sugar; Same-day has
no Cold Proof and no Warm-up. The approved values are:

| | Neapolitan | New York | Deep Dish | Sheet pan | Same-day |
| --- | --- | --- | --- | --- | --- |
| Batch | 4 × 250 g | 4 × 280 g | 2 × 550 g | 1 × 1000 g | 4 × 250 g |
| Hydration | 62% | 63% | 55% | 75% | 60% |
| Salt | 2.8% | 2.0% | 2.0% | 2.2% | 2.5% |
| Oil | – | 2.0% | 12% | 4.0% | 1.0% |
| Sugar | – | 1.5% | 2.0% | – | – |
| Yeast | fresh | dry | dry | dry | dry |
| Bulk | 2 h @ 20 °C | 1 h @ 20 °C | 2 h @ 20 °C | 2 h @ 20 °C | 5 h @ 22 °C |
| Cold | 24 h @ 4 °C | 48 h @ 4 °C | 24 h @ 4 °C | 24 h @ 4 °C | — |
| Warm-up | 2 h | 2 h | 1 h | 2 h | — |
| Bake | 450–485 °C, 60–90 s | 290 °C, 6–8 min | 220 °C, 25–30 min | 250 °C, 15–20 min | 280 °C, 8 min |

### Deviation tracking

A Recipe always knows its Style, so Deviations are derived by comparing the current Recipe
against its Preset rather than stored as flags. This keeps the persisted shape small and
makes "revert this field" a copy from the Preset. Any field differing from its Preset is
marked, shows its Preset value, and offers a single-field revert; a global reset replaces
the whole Recipe with the Preset.

### Persistence

Two mechanisms, per ADR-0005:

- **localStorage** holds the last session under a single versioned key. A version field is
  stored alongside so a future shape change can discard rather than misread old data.
- **The URL hash** holds the complete Recipe in a compact encoding. Encoding and decoding
  are a dedicated codec module with a symmetrical public interface. Bake Time is
  deliberately excluded so links do not go stale.

On load: if a hash is present it wins and localStorage is left untouched until the user
edits something; otherwise the stored session is restored; otherwise the Style picker is
shown. Decoding is defensive — a malformed or truncated hash falls back to the stored
session or the picker rather than throwing.

### Application shape

Two screens. A Style picker, shown on first run, and a workbench holding the Batch, every
adjustment, the Proof Schedule and the solved weights, with the weights pinned in a sticky
header so the result never leaves the screen while adjusting.

Reactive state uses Svelte 5 runes; the solver is called derived-style from the Recipe
state, so there is no manual recomputation anywhere. Sliders and their tappable numeric
entry are one shared component used for every adjustable value.

### Platform

- `@sveltejs/adapter-static` with prerendering, replacing the scaffold's `adapter-node`.
  Already swapped. Per ADR-0006.
- A web app manifest and a service worker precaching the build, making the app installable
  and offline-capable.
- Tailwind 4 for styling, `@lucide/svelte` for icons per the repo convention.
- English UI throughout. Metric throughout.
- The scaffold's demo routes and example spec are removed.

## Testing Decisions

A good test here describes something a baker would recognise and asserts only on the public
surface. Tests state a Recipe and assert the weights and schedule that come back; they never
reach for the ferment constants, the rounding helper or the Activity function, because those
are internals that ADR-0002 explicitly expects to change. A test that has to be rewritten
when a constant is retuned is testing the wrong thing.

Two seams, agreed with the developer:

**The solver.** Every rule in the domain is observable through `solve()`, so it is the only
computation seam. Coverage:

- Each Style's Preset produces plausible, stable weights.
- The displayed weights sum exactly to the Total Dough Weight, including for Styles with oil
  and sugar, and across awkward Batch sizes where rounding drift is largest.
- Changing Hydration holds the Total Dough Weight constant and moves flour and water in
  opposite directions.
- Switching yeast type changes the reported quantity by a factor of three and changes
  nothing else.
- Locking the schedule derives Leavening; locking Leavening derives the Elastic Stage; doing
  both in sequence round-trips to the original values.
- The Elastic Stage is the Cold Proof when present and the Bulk when not — exercised via the
  Same-day Style, which has no Cold Proof.
- Raising the room temperature reduces the Leavening required.
- Leavening high enough to over-ferment drives the Elastic Stage to zero, never negative.

**The URL codec.** A Recipe encoded and decoded returns an equal Recipe, for every Style and
for Recipes carrying Deviations. Malformed, truncated and empty input decode to a null result
rather than throwing.

Nothing else is tested: no component tests, no localStorage tests, no service worker tests,
and no Playwright. Prior art in the repo is thin — the scaffold's `greet.spec.ts` is the only
existing test and is being deleted — so these establish the pattern: plain Vitest, colocated
with the module under test, no test utilities.

## Out of Scope

- **Sourdough.** Deferred to v2 along with the model changes it forces. See ADR-0004 — the
  flat v1 model is deliberate, not an oversight to be tidied up.
- **Active dry yeast.** Not sold in German supermarkets; "dry" means instant dry throughout,
  and no blooming step appears in any Proof Schedule.
- **A named on-device recipe library.** Bookmarks are the save mechanism for v1.
- **Imperial units, cups, or unit switching.**
- **Guidance on plausible ranges** — no shaded slider bands, no warnings for unusual values,
  no advice when yeast falls below what a scale can weigh. The app computes; it does not
  comment.
- **Validating the ferment constants against published data.** Q10 = 3 and K = 6 were fitted
  by hand against three Styles and are shipped as-is; there is no calibration test harness.
- **Flour type, protein content, autolyse, stretch-and-fold schedules, poolish or biga.**
- **Shaping, topping, or baking instructions** beyond the Style's one-line bake string.
- **Accounts, sync, a backend of any kind, and analytics.**
- **Internationalisation.** English only.
- **Playwright and any end-to-end coverage.**

## Further Notes

The ferment constants are the known soft spot. ADR-0002 records that Q10 = 2 — the textbook
default — under-predicts Leavening threefold because it treats a fridge as far more active
than it is, and that Q10 = 3 with K = 6 fits a 5-hour room-temperature dough and a 48-hour
cold one. That fit was checked by hand against three of the five Styles. If predictions
drift, the constants are the first place to look, and adding calibration fixtures is the
natural follow-up.

Two accepted consequences worth restating so they are not later mistaken for bugs. With no
bands and no warnings, the app will compute an unbakeable dough without comment — that is
the chosen posture. And sub-gram yeast quantities are displayed plainly with no workaround
offered, even though small batches on long cold proofs routinely land below what a home
scale can weigh.

Groundwork already committed: the adapter swap, the `@lucide/svelte` dependency,
`CONTEXT.md`, ADRs 0001–0006, and the domain types.

import { describe, expect, it } from "vitest";

import { solve } from "./solve";
import { STYLES, recipeFromStyle, styleById } from "./styles";
import { FRESH_PER_DRY, type SolvedRecipe } from "./types";

describe("the Anchor", () => {
	it("gives the Neapolitan Preset the Total Dough Weight it asked for", () => {
		const solved = solve(recipeFromStyle(styleById("neapolitan")));

		// Four balls of 250 g. A 62% Hydration dough of this size is a shade over
		// 600 g of flour and a shade under 380 g of water.
		expect(solved.totalGrams).toBe(1000);
		expect(solved.flour).toBeGreaterThan(590);
		expect(solved.flour).toBeLessThan(615);
		expect(solved.water).toBeGreaterThan(365);
		expect(solved.water).toBeLessThan(385);
	});

	it("holds the Total Dough Weight when Hydration changes, trading flour for water", () => {
		const recipe = recipeFromStyle(styleById("neapolitan"));
		const wetter = { ...recipe, percentages: { ...recipe.percentages, hydration: 0.75 } };

		const before = solve(recipe);
		const after = solve(wetter);

		expect(after.totalGrams).toBe(before.totalGrams);
		expect(after.water).toBeGreaterThan(before.water);
		expect(after.flour).toBeLessThan(before.flour);
	});

	it("gives the user exactly the Dough Balls they asked for", () => {
		const recipe = recipeFromStyle(styleById("sheet-pan"));
		const solved = solve({ ...recipe, batch: { count: 6, ballGrams: 320 } });

		expect(solved.totalGrams).toBe(1920);
	});
});

describe("yeast type", () => {
	it("reports a third of the weight when the same dough is made with dry yeast", () => {
		const fresh = recipeFromStyle(styleById("neapolitan"));
		const dry = { ...fresh, yeastType: "dry" as const };

		// The baker swaps the block for the sachet; the dough ferments the same, so the
		// sachet is a third of the weight.
		expect(solve(fresh).yeast / solve(dry).yeast).toBeCloseTo(3, 1);
	});

	it("leaves the rest of the Recipe alone when the yeast type changes", () => {
		const dry = recipeFromStyle(styleById("new-york"));
		const fresh = { ...dry, yeastType: "fresh" as const };

		const before = solve(dry);
		const after = solve(fresh);

		// Nothing the user asked for changes: it is the same dough at the same
		// percentages, on the same schedule, at the same Total Dough Weight.
		expect(after.percentages).toEqual(before.percentages);
		expect(after.totalGrams).toBe(before.totalGrams);
		expect(after.schedule).toEqual(before.schedule);

		// The other weights do drift, and cannot not: the Total Dough Weight is the
		// Anchor (ADR-0001), so the ~3 g of extra mass in a block of fresh yeast has to
		// come out of the rest of the dough. Flour gives up those grams, and the
		// ingredients measured off it shed a tenth. It is under half a percent.
		const displaced = before.flour + before.water - (after.flour + after.water);
		expect(displaced).toBeGreaterThan(0);
		expect(displaced).toBeLessThan(0.005 * before.totalGrams);
		for (const [now, then] of [
			[after.salt, before.salt],
			[after.oil, before.oil],
			[after.sugar, before.sugar],
		]) {
			expect(Math.abs(now - then)).toBeLessThanOrEqual(0.1);
		}
	});
});

describe("the ferment model", () => {
	// The Leavening a baker would recognise: a pinch, not a spoonful, and never zero.
	// Published doughs on schedules like these call for something between a fifth of a
	// percent of fresh yeast and two percent, so that is the band each Preset must land
	// in — wide enough not to pin the constants ADR-0002 expects to be retuned, tight
	// enough to fail if they move by the threefold that Q10 = 2 would have cost.
	it.each([...STYLES])("gives $name's Preset schedule a plausible Leavening", (style) => {
		const solved = solve(recipeFromStyle(style));

		// Compared as fresh yeast, so the four dry-yeast Styles are in the same units.
		const freshPercent = solved.yeastPercent * (solved.yeastType === "fresh" ? 1 : FRESH_PER_DRY);

		expect(freshPercent * 100).toBeGreaterThan(0.2);
		expect(freshPercent * 100).toBeLessThan(2);
	});

	it("needs less yeast in a warm kitchen than a cold one", () => {
		const preset = recipeFromStyle(styleById("same-day"));
		const inFebruary = {
			...preset,
			schedule: { ...preset.schedule, bulk: { hours: 5, celsius: 16 } },
		};
		const inAugust = {
			...preset,
			schedule: { ...preset.schedule, bulk: { hours: 5, celsius: 28 } },
		};

		expect(solve(inAugust).yeast).toBeLessThan(solve(inFebruary).yeast);
	});

	it("needs less yeast for a longer proof", () => {
		const recipe = recipeFromStyle(styleById("neapolitan"));
		const longer = {
			...recipe,
			schedule: { ...recipe.schedule, cold: { hours: 48, celsius: 4 } },
		};

		expect(solve(longer).yeast).toBeLessThan(solve(recipe).yeast);
	});

	// A Stage with no hours is absent, not a special case: giving the Same-day Style a
	// zero-length Cold Proof at any temperature is the same dough it already was.
	it("ignores a Stage with a zero duration", () => {
		const sameDay = recipeFromStyle(styleById("same-day"));
		const withEmptyCold = {
			...sameDay,
			schedule: { ...sameDay.schedule, cold: { hours: 0, celsius: 4 } },
		};

		expect(solve(withEmptyCold).yeast).toBe(solve(sameDay).yeast);
	});

	// Temperature is the whole reason the model exists: a day in the fridge is worth
	// only a few hours on the worktop, so it cannot be counted hour for hour.
	it("counts an hour in the fridge for less than an hour at room temperature", () => {
		const recipe = recipeFromStyle(styleById("neapolitan"));
		const anotherColdHour = {
			...recipe,
			schedule: { ...recipe.schedule, cold: { hours: 25, celsius: 4 } },
		};
		const anotherRoomHour = {
			...recipe,
			schedule: { ...recipe.schedule, bulk: { hours: 3, celsius: 20 } },
		};

		const saved = (later: typeof recipe) => solve(recipe).yeast - solve(later).yeast;
		expect(saved(anotherColdHour)).toBeLessThan(saved(anotherRoomHour));
	});
});

/**
 * Adds the displayed weights the way a reader does — in tenths of a gram, so the
 * assertion is about the decimals on screen and not about binary floating point.
 */
const sumOfWeights = (solved: SolvedRecipe) =>
	[solved.flour, solved.water, solved.salt, solved.oil, solved.sugar, solved.yeast].reduce(
		(tenths, weight) => tenths + Math.round(weight * 10),
		0
	) / 10;

describe("rounding", () => {
	it.each([...STYLES])("$name's weights add up to the Total Dough Weight", (style) => {
		const solved = solve(recipeFromStyle(style));

		expect(sumOfWeights(solved)).toBe(solved.totalGrams);
	});

	it("keeps the small ingredients to a tenth of a gram", () => {
		const solved = solve(recipeFromStyle(styleById("new-york")));

		for (const weight of [solved.salt, solved.oil, solved.sugar, solved.yeast]) {
			expect(weight * 10).toBe(Math.round(weight * 10));
		}
	});

	// Awkward Batches are where the drift flour has to absorb is largest: a Total
	// Dough Weight that divides badly, and enough ingredients to round.
	it.each([
		{ count: 3, ballGrams: 267 },
		{ count: 7, ballGrams: 133 },
		{ count: 1, ballGrams: 111 },
		{ count: 11, ballGrams: 249 },
	])("adds up for an awkward Batch of $count × $ballGrams g", (batch) => {
		const recipe = { ...recipeFromStyle(styleById("new-york")), batch };
		const solved = solve(recipe);

		expect(sumOfWeights(solved)).toBe(batch.count * batch.ballGrams);
	});

	// The one place a weight is finer than its stated precision, and deliberately so:
	// flour is the drift absorber, so the tenths the small ingredients round away end
	// up here rather than making the column disagree with the Total Dough Weight.
	it("lets flour carry the tenth the rest of the column rounded away", () => {
		const solved = solve(recipeFromStyle(styleById("neapolitan")));

		expect(solved.flour).toBe(603.6);
		expect(sumOfWeights(solved)).toBe(1000);
	});

	it("keeps water whole", () => {
		const solved = solve(recipeFromStyle(styleById("new-york")));

		expect(solved.water).toBe(Math.round(solved.water));
	});
});

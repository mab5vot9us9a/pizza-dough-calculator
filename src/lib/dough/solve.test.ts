import { describe, expect, it } from "vitest";

import { solve } from "./solve";
import { STYLES, recipeFromStyle, styleById } from "./styles";
import type { SolvedRecipe } from "./types";

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

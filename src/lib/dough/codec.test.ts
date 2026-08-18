import { describe, expect, it } from "vitest";

import { decodeRecipe, encodeRecipe } from "./codec";
import { withLock } from "./solve";
import { STYLES, recipeFromStyle, styleById } from "./styles";

describe("encoding a Recipe into a link", () => {
	it("gives every Style back exactly as it went in", () => {
		for (const style of STYLES) {
			const recipe = recipeFromStyle(style);
			expect(decodeRecipe(encodeRecipe(recipe))).toEqual(recipe);
		}
	});

	it("carries Deviations, so a link is the dough the sender was looking at", () => {
		const recipe = recipeFromStyle(styleById("new-york"));
		const mine = {
			...recipe,
			batch: { count: 6, ballGrams: 305 },
			percentages: { hydration: 0.685, salt: 0.024, oil: 0.035, sugar: 0 },
			yeastType: "fresh" as const,
			schedule: {
				bulk: { hours: 1.5, celsius: 23.5 },
				cold: { hours: 36, celsius: 5.5 },
				warmUp: { hours: 2.5, celsius: 23.5 },
			},
		};

		expect(decodeRecipe(encodeRecipe(mine))).toEqual(mine);
	});

	it("carries the Lock, so a yeast-locked dough does not arrive schedule-locked", () => {
		const locked = withLock(recipeFromStyle(styleById("neapolitan")), "leavening");
		const decoded = decodeRecipe(encodeRecipe(locked));

		expect(decoded).toEqual(locked);
		expect(decoded?.lock).toBe("leavening");
		expect(decoded?.freshYeastPercent).toBe(locked.freshYeastPercent);
	});

	it("keeps the two room temperatures apart, as the Same-day Preset holds them", () => {
		// One control writes both, but a Preset can still name them separately: Same-day
		// bulks at 22 °C and says 20 °C for the Warm-up it does not have.
		const recipe = recipeFromStyle(styleById("same-day"));
		const decoded = decodeRecipe(encodeRecipe(recipe));

		expect(decoded?.schedule.bulk.celsius).toBe(22);
		expect(decoded?.schedule.warmUp.celsius).toBe(20);
	});

	it("uses only characters a URL leaves alone", () => {
		for (const style of STYLES) {
			expect(encodeRecipe(recipeFromStyle(style))).toMatch(/^[A-Za-z0-9\-._~]+$/);
		}
	});
});

describe("decoding a link that is not one", () => {
	const valid = encodeRecipe(recipeFromStyle(styleById("neapolitan")));

	it("refuses nothing at all", () => {
		expect(decodeRecipe("")).toBeNull();
	});

	it("refuses text that was never a Recipe", () => {
		expect(decodeRecipe("hello")).toBeNull();
		expect(decodeRecipe("#/some/other/app")).toBeNull();
	});

	it("refuses a link that lost its tail on the way", () => {
		for (let length = 1; length < valid.length; length += 1) {
			expect(decodeRecipe(valid.slice(0, length))).toBeNull();
		}
	});

	it("refuses a link written by a version it does not know", () => {
		expect(decodeRecipe(valid.replace(/^1/, "2"))).toBeNull();
	});

	it("refuses a Style it has never heard of", () => {
		const fields = valid.split("~");
		fields[1] = "99";

		expect(decodeRecipe(fields.join("~"))).toBeNull();
	});

	it("refuses a number that is not one", () => {
		const fields = valid.split("~");

		for (let index = 4; index < fields.length; index += 1) {
			const mangled = [...fields];
			mangled[index] = "wet";
			expect(decodeRecipe(mangled.join("~"))).toBeNull();
		}
	});

	it("refuses a link carrying more than it should", () => {
		expect(decodeRecipe(`${valid}~7`)).toBeNull();
	});
});

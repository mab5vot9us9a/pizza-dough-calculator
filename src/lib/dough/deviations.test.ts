import { describe, expect, it } from "vitest";

import { deviationsOf, isModified, resetToPreset, revert } from "./deviations";
import { withLock } from "./solve";
import { STYLES, recipeFromStyle, styleById } from "./styles";

describe("marking Deviations", () => {
	it("marks nothing on a Recipe straight out of its Style", () => {
		for (const style of STYLES) {
			expect(deviationsOf(recipeFromStyle(style))).toEqual({});
			expect(isModified(recipeFromStyle(style))).toBe(false);
		}
	});

	it("marks a wetter dough, and says what the Style asked for", () => {
		const recipe = recipeFromStyle(styleById("neapolitan"));
		const wetter = { ...recipe, percentages: { ...recipe.percentages, hydration: 0.7 } };

		expect(deviationsOf(wetter)).toEqual({ hydration: 0.62 });
		expect(isModified(wetter)).toBe(true);
	});

	it("marks the Batch, the yeast type and every Proof Schedule value", () => {
		const recipe = recipeFromStyle(styleById("new-york"));

		const changed = {
			...recipe,
			batch: { count: 6, ballGrams: 300 },
			yeastType: "fresh" as const,
			schedule: {
				bulk: { hours: 3, celsius: 24 },
				cold: { hours: 12, celsius: 6 },
				warmUp: { hours: 1, celsius: 24 },
			},
		};

		expect(deviationsOf(changed)).toEqual({
			count: 4,
			ballGrams: 280,
			yeastType: "dry",
			bulkHours: 1,
			coldHours: 48,
			warmUpHours: 2,
			roomCelsius: 20,
			fridgeCelsius: 4,
		});
	});

	it("marks a Leavening the baker set, but not one the schedule derived", () => {
		const recipe = recipeFromStyle(styleById("neapolitan"));

		// With the schedule locked the quantity is an answer, so a longer Cold Proof
		// moves the yeast without that being a choice the baker made about yeast.
		const longer = { ...recipe, schedule: { ...recipe.schedule, cold: { hours: 48, celsius: 4 } } };
		expect(deviationsOf(longer)).toEqual({ coldHours: 24 });

		// Lock the yeast and ask for twice as much, and it is a choice.
		const locked = withLock(recipe, "leavening");
		const doubled = { ...locked, freshYeastPercent: locked.freshYeastPercent * 2 };
		expect(Object.keys(deviationsOf(doubled))).toEqual(["leavening"]);
	});

	it("does not mark the Stage the Leavening is driving", () => {
		const locked = withLock(recipeFromStyle(styleById("neapolitan")), "leavening");
		const doubled = { ...locked, freshYeastPercent: locked.freshYeastPercent * 2 };

		// The screen banks the Elastic Stage's solved duration into the Recipe as the
		// baker moves the Stages around it. That figure is the app's answer, not a choice,
		// so the Cold Proof is not marked — and cannot leave the Recipe reading "modified"
		// about a number with no control to revert.
		const banked = {
			...doubled,
			schedule: { ...doubled.schedule, cold: { ...doubled.schedule.cold, hours: 11.42 } },
		};

		expect(Object.keys(deviationsOf(banked))).toEqual(["leavening"]);

		// Hand the Proof Schedule back the wheel and the same duration is the baker's
		// again, so now it is a Deviation with a way back.
		expect(deviationsOf({ ...banked, lock: "schedule" as const }).coldHours).toBe(24);
	});

	it("does not mark the Bulk on a Style with no Cold Proof to drive", () => {
		const locked = withLock(recipeFromStyle(styleById("same-day")), "leavening");
		const banked = {
			...locked,
			schedule: { ...locked.schedule, bulk: { hours: 7.3, celsius: 22 } },
		};

		expect(deviationsOf(banked)).toEqual({});
	});

	it("does not mark a Recipe that only flipped which side is locked", () => {
		const recipe = recipeFromStyle(styleById("sheet-pan"));

		expect(deviationsOf(withLock(recipe, "leavening"))).toEqual({});
	});
});

describe("reverting", () => {
	it("puts one field back and leaves the others where the baker left them", () => {
		const recipe = recipeFromStyle(styleById("same-day"));
		const changed = {
			...recipe,
			percentages: { ...recipe.percentages, hydration: 0.7, salt: 0.03 },
		};

		const reverted = revert(changed, "hydration");

		expect(reverted.percentages.hydration).toBe(recipe.percentages.hydration);
		expect(reverted.percentages.salt).toBe(0.03);
		expect(deviationsOf(reverted)).toEqual({ salt: 0.025 });
	});

	it("puts the room temperature back on both Stages it drives", () => {
		const recipe = recipeFromStyle(styleById("neapolitan"));
		const warmer = {
			...recipe,
			schedule: {
				...recipe.schedule,
				bulk: { hours: 2, celsius: 26 },
				warmUp: { hours: 2, celsius: 26 },
			},
		};

		const reverted = revert(warmer, "roomCelsius");

		expect(reverted.schedule.bulk.celsius).toBe(20);
		expect(reverted.schedule.warmUp.celsius).toBe(20);
	});

	it("leaves the Recipe it was given untouched", () => {
		const recipe = recipeFromStyle(styleById("deep-dish"));
		const changed = { ...recipe, batch: { count: 5, ballGrams: 400 } };

		revert(changed, "count");

		expect(changed.batch.count).toBe(5);
	});
});

describe("resetting", () => {
	it("gives back the Style's Preset, whatever was changed", () => {
		const recipe = recipeFromStyle(styleById("deep-dish"));
		const changed = withLock(
			{
				...recipe,
				batch: { count: 9, ballGrams: 111 },
				percentages: { hydration: 0.9, salt: 0.05, oil: 0, sugar: 0 },
				yeastType: "fresh" as const,
			},
			"leavening"
		);

		const reset = resetToPreset(changed);

		expect(reset).toEqual(recipe);
		expect(isModified(reset)).toBe(false);
	});
});

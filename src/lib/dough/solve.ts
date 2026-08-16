import { FRESH_PER_DRY, type Recipe, type SolvedRecipe } from "./types";

const toGram = (grams: number) => Math.round(grams);
const toTenth = (grams: number) => Math.round(grams * 10) / 10;

/**
 * Solves a Recipe into gram weights.
 *
 * The Total Dough Weight is the Anchor (ADR-0001): it is what the user asked for,
 * so flour is solved backwards from it and no percentage change can move it.
 */
export function solve(recipe: Recipe): SolvedRecipe {
	const { hydration, salt, oil, sugar } = recipe.percentages;
	const totalGrams = recipe.batch.count * recipe.batch.ballGrams;

	// Leavening enters the dough in the yeast type the user is actually weighing out.
	// `recipe.lock` is not consulted yet: until the ferment model lands, the Preset's
	// literal `freshYeastPercent` is treated like any other ingredient percentage.
	const yeastPercent =
		recipe.yeastType === "fresh"
			? recipe.freshYeastPercent
			: recipe.freshYeastPercent / FRESH_PER_DRY;

	// Full precision internally; only the returned weights are rounded.
	const flour = totalGrams / (1 + hydration + salt + oil + sugar + yeastPercent);

	const water = toGram(flour * hydration);
	const smalls = {
		salt: toTenth(flour * salt),
		oil: toTenth(flour * oil),
		sugar: toTenth(flour * sugar),
		yeast: toTenth(flour * yeastPercent),
	};

	// Flour absorbs the drift the roundings above introduced, so the column the
	// user reads adds up to the Total Dough Weight they asked for.
	//
	// This is why flour, alone among the weights, can carry a tenth: the tenths the
	// small ingredients round away have to land somewhere, and a column that does not
	// sum to the stated total reads as a bug. Rounding flour to the gram as well would
	// show four 250 g balls adding up to 1000.4 g.
	const rest = water + smalls.salt + smalls.oil + smalls.sugar + smalls.yeast;

	return {
		flour: toTenth(totalGrams - rest),
		water,
		...smalls,
		yeastType: recipe.yeastType,
		yeastPercent,
		percentages: recipe.percentages,
		totalGrams,
		schedule: recipe.schedule,
	};
}

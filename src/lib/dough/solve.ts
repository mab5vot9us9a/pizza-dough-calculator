import { elasticStageOf, leaveningFor, scheduleFor } from "./ferment";
import { type Lock, type Recipe, type SolvedRecipe } from "./types";
import { inYeastType } from "./yeast";

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

	// The two ends of one equation (ADR-0003). Whichever end the user locked is taken
	// as given, and the other is solved for: the schedule decides the Leavening, or the
	// Leavening decides how long the Elastic Stage runs.
	const locked = recipe.lock === "leavening";
	const freshYeastPercent = locked ? recipe.freshYeastPercent : leaveningFor(recipe.schedule);
	const schedule = locked ? scheduleFor(recipe.schedule, freshYeastPercent) : recipe.schedule;

	// It enters the dough as the type the baker is actually weighing out.
	const yeastPercent = inYeastType(freshYeastPercent, recipe.yeastType);

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
		schedule,
		// Read off the Recipe's own schedule, not the solved one: once too much yeast has
		// driven the Cold Proof to zero it is still the Stage giving way, and the Bulk must
		// not quietly take over and start shrinking too.
		elasticStage: elasticStageOf(recipe.schedule),
	};
}

/**
 * Flips which end of the Leavening/Proof Schedule relationship the user drives.
 *
 * The side about to become derived is first written with what the baker was looking
 * at a moment ago, so flipping the Lock never moves the dough under their hands.
 */
export function withLock(recipe: Recipe, lock: Lock): Recipe {
	if (recipe.lock === lock) return recipe;

	if (lock === "leavening") {
		return { ...recipe, lock, freshYeastPercent: leaveningFor(recipe.schedule) };
	}
	return { ...recipe, lock, schedule: scheduleFor(recipe.schedule, recipe.freshYeastPercent) };
}

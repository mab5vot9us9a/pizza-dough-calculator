import { elasticStageOf, leaveningFor } from "./ferment";
import { copyRecipe, recipeFromStyle, styleById } from "./styles";
import type { Percentages, ProofSchedule, Recipe, Style, YeastType } from "./types";

/**
 * Deviations: where a Recipe has moved away from its Style's Preset.
 *
 * Nothing is stored. A Recipe always knows its Style, so the marks are a comparison
 * against the Preset every time they are asked for — which keeps the persisted shape
 * small and makes reverting one field a copy out of the Preset.
 */

/**
 * The fields that can deviate — one per adjustment the app offers, no more.
 *
 * The Warm-up temperature is not among them: it has no control of its own, it follows
 * the room. Nor is the Lock, which is not a value of the dough but which side of the
 * Leavening relationship the baker is driving.
 */
export type DeviationField =
	| "count"
	| "ballGrams"
	| "hydration"
	| "salt"
	| "oil"
	| "sugar"
	| "yeastType"
	| "bulkHours"
	| "coldHours"
	| "warmUpHours"
	| "roomCelsius"
	| "fridgeCelsius"
	| "leavening";

/** A Baker's Percentage, a duration, a temperature, a count — or a yeast type. */
export type DeviationValue = number | YeastType;

/** What the Preset said, for each field the Recipe no longer agrees with it about. */
export type Deviations = Partial<Record<DeviationField, DeviationValue>>;

interface FieldSpec {
	of: (recipe: Recipe, style: Style) => DeviationValue;
	preset: (style: Style) => DeviationValue;
	/** Writes the Preset's value back in. Always called on a copy. */
	restore: (draft: Recipe, style: Style) => void;
}

const percentage = (key: keyof Percentages): FieldSpec => ({
	of: (recipe) => recipe.percentages[key],
	preset: (style) => style.percentages[key],
	restore: (draft, style) => {
		draft.percentages[key] = style.percentages[key];
	},
});

const duration = (key: keyof ProofSchedule): FieldSpec => ({
	/*
	 * A Stage's hours are the baker's, except while the Leavening is locked and this
	 * is the Stage giving way — then they are the app's answer, so they read as the
	 * Preset's and are never marked. It is the same rule as the Leavening below, from
	 * the other end of ADR-0003's relationship: whichever side the app is solving for
	 * cannot be a choice the baker made.
	 */
	of: (recipe, style) =>
		recipe.lock === "leavening" && elasticStageOf(recipe.schedule) === key
			? style.schedule[key].hours
			: recipe.schedule[key].hours,
	preset: (style) => style.schedule[key].hours,
	restore: (draft, style) => {
		draft.schedule[key].hours = style.schedule[key].hours;
	},
});

const FIELDS: Record<DeviationField, FieldSpec> = {
	count: {
		of: (recipe) => recipe.batch.count,
		preset: (style) => style.batch.count,
		restore: (draft, style) => {
			draft.batch.count = style.batch.count;
		},
	},
	ballGrams: {
		of: (recipe) => recipe.batch.ballGrams,
		preset: (style) => style.batch.ballGrams,
		restore: (draft, style) => {
			draft.batch.ballGrams = style.batch.ballGrams;
		},
	},
	hydration: percentage("hydration"),
	salt: percentage("salt"),
	oil: percentage("oil"),
	sugar: percentage("sugar"),
	yeastType: {
		of: (recipe) => recipe.yeastType,
		preset: (style) => style.yeastType,
		restore: (draft, style) => {
			draft.yeastType = style.yeastType;
		},
	},
	bulkHours: duration("bulk"),
	coldHours: duration("cold"),
	warmUpHours: duration("warmUp"),
	roomCelsius: {
		// One room temperature drives both the Bulk and the Warm-up, as the control does.
		of: (recipe) => recipe.schedule.bulk.celsius,
		preset: (style) => style.schedule.bulk.celsius,
		restore: (draft, style) => {
			draft.schedule.bulk.celsius = style.schedule.bulk.celsius;
			draft.schedule.warmUp.celsius = style.schedule.warmUp.celsius;
		},
	},
	fridgeCelsius: {
		of: (recipe) => recipe.schedule.cold.celsius,
		preset: (style) => style.schedule.cold.celsius,
		restore: (draft, style) => {
			draft.schedule.cold.celsius = style.schedule.cold.celsius;
		},
	},
	leavening: {
		/*
		 * A Preset carries no Leavening figure — it is whatever its own Proof Schedule
		 * asks for — so the comparison derives one.
		 *
		 * And only the Leavening the baker actually set can deviate. With the schedule
		 * locked the quantity is an answer, not a choice, so it reads as the Preset's
		 * and is never marked: the Stage durations behind it carry the marks instead.
		 */
		of: (recipe, style) =>
			recipe.lock === "leavening" ? recipe.freshYeastPercent : leaveningFor(style.schedule),
		preset: (style) => leaveningFor(style.schedule),
		restore: (draft, style) => {
			draft.freshYeastPercent = leaveningFor(style.schedule);
		},
	},
};

/**
 * Two values the user would call the same number.
 *
 * Percentages make a round trip through the screen's own units (63% is stored as
 * 0.63), and floating point does not always land back exactly where it started. A
 * tolerance far below anything displayed keeps that arithmetic from reading as a
 * Deviation the baker never made.
 */
const EPSILON = 1e-9;

const same = (a: DeviationValue, b: DeviationValue) =>
	typeof a === "number" && typeof b === "number" ? Math.abs(a - b) < EPSILON : a === b;

/** Every field the Recipe has moved away from its Preset, and what the Preset said. */
export function deviationsOf(recipe: Recipe): Deviations {
	const style = styleById(recipe.styleId);
	const marked: Deviations = {};

	for (const field of Object.keys(FIELDS) as DeviationField[]) {
		const preset = FIELDS[field].preset(style);
		if (!same(FIELDS[field].of(recipe, style), preset)) marked[field] = preset;
	}

	return marked;
}

/** Whether the Recipe is still exactly the Style it names. */
export function isModified(recipe: Recipe): boolean {
	return Object.keys(deviationsOf(recipe)).length > 0;
}

/** The Recipe with one field put back the way its Preset had it. */
export function revert(recipe: Recipe, field: DeviationField): Recipe {
	const draft = copyRecipe(recipe);
	FIELDS[field].restore(draft, styleById(recipe.styleId));
	return draft;
}

/** The Recipe thrown away and its Style started again. */
export function resetToPreset(recipe: Recipe): Recipe {
	return recipeFromStyle(styleById(recipe.styleId));
}

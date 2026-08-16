/**
 * The domain types for a dough Recipe. See CONTEXT.md for the language.
 */

/** Fresh yeast (Frischhefe) or instant dry yeast (Trockenhefe). */
export type YeastType = "fresh" | "dry";

/** Fresh yeast is three times the weight of instant dry for the same effect. */
export const FRESH_PER_DRY = 3;

export type StyleId = "neapolitan" | "new-york" | "deep-dish" | "sheet-pan" | "same-day";

/**
 * One segment of a Proof Schedule. A Stage with `hours: 0` is absent — the
 * Same-day style has no Cold Proof, and no Warm-up without one.
 */
export interface Stage {
	hours: number;
	celsius: number;
}

/** The ordered Stages a dough passes through between mixing and baking. */
export interface ProofSchedule {
	bulk: Stage;
	cold: Stage;
	warmUp: Stage;
}

/**
 * Which side of the Leavening/Proof Schedule relationship the user is driving.
 * See ADR-0003.
 */
export type Lock = "schedule" | "leavening";

/** Everything except flour, as a Baker's Percentage of flour weight. */
export interface Percentages {
	hydration: number;
	salt: number;
	oil: number;
	sugar: number;
}

/** How many Dough Balls, and what each should weigh in grams. */
export interface Batch {
	count: number;
	ballGrams: number;
}

export interface Recipe {
	styleId: StyleId;
	batch: Batch;
	percentages: Percentages;
	yeastType: YeastType;
	schedule: ProofSchedule;
	lock: Lock;
	/**
	 * Leavening as a Baker's Percentage, always expressed as fresh yeast so the
	 * ferment model has one unit. Only meaningful when `lock` is `"leavening"`;
	 * otherwise it is derived from the schedule.
	 */
	freshYeastPercent: number;
}

/** A Preset is the starting values a Style seeds a Recipe with. */
export interface Style {
	id: StyleId;
	name: string;
	blurb: string;
	batch: Batch;
	percentages: Percentages;
	yeastType: YeastType;
	schedule: ProofSchedule;
	/**
	 * Leavening as a Baker's Percentage of fresh yeast. A literal placeholder until
	 * the ferment model derives it from the Proof Schedule.
	 */
	freshYeastPercent: number;
	bake: string;
}

/** Grams of everything, plus the percentages they were derived from. */
export interface SolvedRecipe {
	flour: number;
	water: number;
	salt: number;
	oil: number;
	sugar: number;
	yeast: number;
	yeastType: YeastType;
	/** Leavening as a Baker's Percentage in the chosen yeast type's own units. */
	yeastPercent: number;
	/** The Baker's Percentages the weights above were derived from. */
	percentages: Percentages;
	totalGrams: number;
	schedule: ProofSchedule;
}

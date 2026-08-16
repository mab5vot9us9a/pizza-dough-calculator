import { FRESH_PER_DRY, type YeastType } from "./types";

/**
 * Leavening is held as fresh yeast whatever the baker is using, so the ferment model
 * has one unit (see `Recipe.freshYeastPercent`). These are the two ends of that
 * conversion, kept here so the solver and the screen cannot disagree about it.
 */

/** The Leavening in the units of the yeast actually being weighed out. */
export function inYeastType(freshPercent: number, type: YeastType): number {
	return type === "fresh" ? freshPercent : freshPercent / FRESH_PER_DRY;
}

/** A Leavening the baker stated in their own yeast, back in the model's units. */
export function asFreshPercent(percent: number, type: YeastType): number {
	return type === "fresh" ? percent : percent * FRESH_PER_DRY;
}

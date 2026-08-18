import { leaveningFor } from "./ferment";
import type { Recipe, Style, StyleId } from "./types";

/**
 * The five Styles that ship with v1, with the approved Preset values.
 *
 * A Preset carries no Leavening figure: it is what the Style's Proof Schedule asks
 * for, so it is derived rather than written down twice.
 */
export const STYLES: readonly Style[] = [
	{
		id: "neapolitan",
		name: "Neapolitan",
		blurb: "Soft, blistered, and bare. A screaming-hot oven and 90 seconds.",
		batch: { count: 4, ballGrams: 250 },
		percentages: { hydration: 0.62, salt: 0.028, oil: 0, sugar: 0 },
		yeastType: "fresh",
		schedule: {
			bulk: { hours: 2, celsius: 20 },
			cold: { hours: 24, celsius: 4 },
			warmUp: { hours: 2, celsius: 20 },
		},
		bake: "450–485 °C, 60–90 s",
	},
	{
		id: "new-york",
		name: "New York",
		blurb: "Big foldable slices. Oil and sugar for a chewy crust that browns.",
		batch: { count: 4, ballGrams: 280 },
		percentages: { hydration: 0.63, salt: 0.02, oil: 0.02, sugar: 0.015 },
		yeastType: "dry",
		schedule: {
			bulk: { hours: 1, celsius: 20 },
			cold: { hours: 48, celsius: 4 },
			warmUp: { hours: 2, celsius: 20 },
		},
		bake: "290 °C, 6–8 min",
	},
	{
		id: "deep-dish",
		name: "Deep Dish",
		blurb: "Chicago-style. A rich, almost pastry-like dough baked in a pan.",
		batch: { count: 2, ballGrams: 550 },
		percentages: { hydration: 0.55, salt: 0.02, oil: 0.12, sugar: 0.02 },
		yeastType: "dry",
		schedule: {
			bulk: { hours: 2, celsius: 20 },
			cold: { hours: 24, celsius: 4 },
			warmUp: { hours: 1, celsius: 20 },
		},
		bake: "220 °C, 25–30 min",
	},
	{
		id: "sheet-pan",
		name: "Sheet Pan",
		blurb: "Roman teglia. Very wet, very open, pressed out into a tray.",
		batch: { count: 1, ballGrams: 1000 },
		percentages: { hydration: 0.75, salt: 0.022, oil: 0.04, sugar: 0 },
		yeastType: "dry",
		schedule: {
			bulk: { hours: 2, celsius: 20 },
			cold: { hours: 24, celsius: 4 },
			warmUp: { hours: 2, celsius: 20 },
		},
		bake: "250 °C, 15–20 min",
	},
	{
		id: "same-day",
		name: "Same-day",
		blurb: "Mixed in the morning, baked in the evening. No fridge involved.",
		batch: { count: 4, ballGrams: 250 },
		percentages: { hydration: 0.6, salt: 0.025, oil: 0.01, sugar: 0 },
		yeastType: "dry",
		schedule: {
			bulk: { hours: 5, celsius: 22 },
			cold: { hours: 0, celsius: 4 },
			warmUp: { hours: 0, celsius: 20 },
		},
		bake: "280 °C, 8 min",
	},
];

export function styleById(id: StyleId): Style {
	const style = STYLES.find((candidate) => candidate.id === id);
	if (!style) throw new Error(`Unknown style: ${id}`);
	return style;
}

/**
 * A Recipe that shares nothing with the one it was copied from.
 *
 * Recipes are handed around as values — solved, reverted, reset, encoded — so the
 * one deep copy every caller needs lives here rather than being written out again
 * each time a nested Stage or the Batch has to come along.
 */
export function copyRecipe(recipe: Recipe): Recipe {
	return {
		...recipe,
		batch: { ...recipe.batch },
		percentages: { ...recipe.percentages },
		schedule: {
			bulk: { ...recipe.schedule.bulk },
			cold: { ...recipe.schedule.cold },
			warmUp: { ...recipe.schedule.warmUp },
		},
	};
}

/** Seeds a fresh Recipe from a Style's Preset. */
export function recipeFromStyle(style: Style): Recipe {
	return {
		styleId: style.id,
		batch: { ...style.batch },
		percentages: { ...style.percentages },
		yeastType: style.yeastType,
		schedule: {
			bulk: { ...style.schedule.bulk },
			cold: { ...style.schedule.cold },
			warmUp: { ...style.schedule.warmUp },
		},
		lock: "schedule",
		// Seeded so the figure is already right if the user locks the Leavening.
		freshYeastPercent: leaveningFor(style.schedule),
	};
}

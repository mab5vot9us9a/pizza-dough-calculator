/**
 * The dough domain. Pure TypeScript — no Svelte, no browser, no storage.
 *
 * `solve()` is the whole interface for computation: the Anchor arithmetic, the
 * ferment model and the rounding live behind it and are deliberately not exported.
 * Alongside it, the codec is the whole interface for writing a Recipe down.
 */
export * from "./types";
export { decodeRecipe, encodeRecipe } from "./codec";
export {
	type DeviationField,
	type DeviationValue,
	type Deviations,
	deviationsOf,
	isModified,
	resetToPreset,
	revert,
} from "./deviations";
export { STYLES, copyRecipe, recipeFromStyle, styleById } from "./styles";
export { solve, withLock } from "./solve";
export { asFreshPercent, inYeastType } from "./yeast";

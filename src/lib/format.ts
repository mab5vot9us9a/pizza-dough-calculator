/**
 * Display helpers. Weights arrive from the solver already rounded, so these only
 * decide how many decimals to show, never what the number is.
 */

/** Drops a trailing `.0` — "375 g" reads better than "375.0 g" on a scale. */
export function formatGrams(grams: number): string {
	return Number.isInteger(grams) ? String(grams) : grams.toFixed(1);
}

/** A Baker's Percentage as the baker writes it: 0.62 becomes "62%". */
export function formatPercent(fraction: number): string {
	const percent = fraction * 100;
	return `${percent < 10 ? Number(percent.toFixed(2)) : Number(percent.toFixed(1))}%`;
}

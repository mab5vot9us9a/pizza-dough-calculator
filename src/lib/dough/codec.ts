import type { Lock, Recipe, StyleId, YeastType } from "./types";

/**
 * A Recipe as a string, and back again. The URL is the save mechanism (ADR-0005),
 * so this is what a bookmark and a shared link actually hold.
 *
 * The format is positional and versioned: a leading version, three enums as their
 * index, then the numbers in a fixed order, joined by a separator. Positions are the
 * format — append to the lists below, never reorder or remove, or every link already
 * in the wild starts meaning something else. A shape change that cannot be made that
 * way bumps VERSION instead, and older links decode to nothing rather than to a
 * misread dough.
 *
 * Decoding is total: anything that is not a link this module wrote comes back null.
 */

const VERSION = "1";

/** Unreserved in a URL, so nothing here is ever percent-encoded. */
const SEPARATOR = "~";

const STYLE_IDS = [
	"neapolitan",
	"new-york",
	"deep-dish",
	"sheet-pan",
	"same-day",
] as const satisfies readonly StyleId[];

/**
 * Fails to compile when a Style has no position here — which would otherwise encode
 * as -1 and produce links that never decode, caught only by a test remembering to
 * walk every Style.
 */
export type EveryStyleHasAPosition = Record<Exclude<StyleId, (typeof STYLE_IDS)[number]>, never>;
const YEAST_TYPES: readonly YeastType[] = ["fresh", "dry"];
const LOCKS: readonly Lock[] = ["schedule", "leavening"];

/**
 * Every number a Recipe holds, in the order the format writes them.
 *
 * The two room temperatures are both written out even though one control sets both,
 * because a Preset can hold them apart — the Same-day Style bulks at 22 °C and names
 * 20 °C for the Warm-up it does not have. A link says what the Recipe says.
 */
const NUMBERS = [
	"count",
	"ballGrams",
	"hydration",
	"salt",
	"oil",
	"sugar",
	"bulkHours",
	"roomCelsius",
	"coldHours",
	"fridgeCelsius",
	"warmUpHours",
	"warmUpCelsius",
	"freshYeastPercent",
] as const;

type NumberField = (typeof NUMBERS)[number];

/** Version, the three enums, the numbers, then the checksum. */
const FIELD_COUNT = 4 + NUMBERS.length + 1;

export function encodeRecipe(recipe: Recipe): string {
	const { batch, percentages: percent, schedule } = recipe;

	const numbers: Record<NumberField, number> = {
		count: batch.count,
		ballGrams: batch.ballGrams,
		hydration: percent.hydration,
		salt: percent.salt,
		oil: percent.oil,
		sugar: percent.sugar,
		bulkHours: schedule.bulk.hours,
		roomCelsius: schedule.bulk.celsius,
		coldHours: schedule.cold.hours,
		fridgeCelsius: schedule.cold.celsius,
		warmUpHours: schedule.warmUp.hours,
		warmUpCelsius: schedule.warmUp.celsius,
		freshYeastPercent: recipe.freshYeastPercent,
	};

	const payload = [
		VERSION,
		STYLE_IDS.indexOf(recipe.styleId),
		YEAST_TYPES.indexOf(recipe.yeastType),
		LOCKS.indexOf(recipe.lock),
		...NUMBERS.map((field) => numbers[field]),
	].join(SEPARATOR);

	return `${payload}${SEPARATOR}${checksum(payload)}`;
}

export function decodeRecipe(encoded: string): Recipe | null {
	const fields = encoded.split(SEPARATOR);
	if (fields.length !== FIELD_COUNT || fields[0] !== VERSION) return null;

	const styleId = oneOf(STYLE_IDS, fields[1]);
	const yeastType = oneOf(YEAST_TYPES, fields[2]);
	const lock = oneOf(LOCKS, fields[3]);
	if (styleId === null || yeastType === null || lock === null) return null;

	const numbers = {} as Record<NumberField, number>;
	for (const [index, field] of NUMBERS.entries()) {
		const value = numberFrom(fields[4 + index]);
		if (value === null) return null;
		numbers[field] = value;
	}

	// Last, so that a link failing on both counts fails on the specific thing that is
	// wrong with it. A link is a string a person copies, pastes and sometimes cuts in
	// half, and every field on its own is plausible as some other number — so only the
	// checksum can tell a truncated or edited link from a shorter dough someone meant.
	if (fields[FIELD_COUNT - 1] !== checksum(fields.slice(0, -1).join(SEPARATOR))) return null;

	return {
		styleId,
		batch: { count: numbers.count, ballGrams: numbers.ballGrams },
		percentages: {
			hydration: numbers.hydration,
			salt: numbers.salt,
			oil: numbers.oil,
			sugar: numbers.sugar,
		},
		yeastType,
		schedule: {
			bulk: { hours: numbers.bulkHours, celsius: numbers.roomCelsius },
			cold: { hours: numbers.coldHours, celsius: numbers.fridgeCelsius },
			warmUp: { hours: numbers.warmUpHours, celsius: numbers.warmUpCelsius },
		},
		lock,
		freshYeastPercent: numbers.freshYeastPercent,
	};
}

/** The value a position stands for, or null if the position names nothing. */
function oneOf<T>(values: readonly T[], field: string): T | null {
	const index = Number(field);
	return field !== "" && Number.isInteger(index) && index >= 0 && index < values.length
		? values[index]
		: null;
}

/** A number, or null — including for the empty string, which Number() reads as zero. */
function numberFrom(field: string): number | null {
	if (field === "") return null;
	const value = Number(field);
	return Number.isFinite(value) ? value : null;
}

/**
 * FNV-1a over the payload, in base 36 — digits and lowercase letters, so it costs
 * six characters and no escaping. It guards against a mangled link, not a malicious
 * one: there is nothing here worth forging.
 */
function checksum(payload: string): string {
	let hash = 0x811c9dc5;
	for (let index = 0; index < payload.length; index += 1) {
		hash ^= payload.charCodeAt(index);
		hash = Math.imul(hash, 0x01000193);
	}
	return (hash >>> 0).toString(36);
}

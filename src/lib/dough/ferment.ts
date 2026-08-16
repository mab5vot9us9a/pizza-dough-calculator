import type { ProofSchedule, Stage } from "./types";

/**
 * The ferment model: how much yeast a Proof Schedule asks for.
 *
 * Internal to the dough module by design: this file is not re-exported from the
 * barrel. ADR-0002 records these two constants as the likeliest thing in the app to
 * change — they were fitted by hand against three of the five Styles — so nothing
 * outside the module may reach them.
 */

/** How much faster the dough ferments per 10 °C. The textbook 2 treats a fridge as far too active. */
const Q10 = 3;

/** The temperature the rate law is written around. */
const REFERENCE_CELSIUS = 20;

/**
 * A dough is correctly leavened when `freshYeastPercent × activity` reaches this.
 *
 * ADR-0002 writes the 6 against a Leavening counted in percentage points; everything
 * here is a Baker's Percentage held as a fraction, so it is a hundredth of that.
 */
const TARGET_ACTIVITY = 6 / 100;

/**
 * How much fermentation a Stage delivers: its hours, scaled by how much the
 * temperature speeds them up or slows them down.
 *
 * A Stage of zero hours contributes zero. That is the whole of "a Stage with no
 * duration is absent" — it needs no special case anywhere.
 */
const activityOfStage = ({ hours, celsius }: Stage) =>
	hours * Q10 ** ((celsius - REFERENCE_CELSIUS) / 10);

/** The Activity a whole Proof Schedule delivers. */
const activityOf = (schedule: ProofSchedule) =>
	activityOfStage(schedule.bulk) +
	activityOfStage(schedule.cold) +
	activityOfStage(schedule.warmUp);

/**
 * The Leavening a Proof Schedule asks for, as a Baker's Percentage of fresh yeast.
 *
 * A schedule with no proofing time at all has no answer — no quantity of yeast
 * ferments a dough in zero hours — so it reports none rather than an infinity that
 * would poison the Anchor arithmetic downstream.
 */
export function leaveningFor(schedule: ProofSchedule): number {
	const activity = activityOf(schedule);
	return activity > 0 ? TARGET_ACTIVITY / activity : 0;
}

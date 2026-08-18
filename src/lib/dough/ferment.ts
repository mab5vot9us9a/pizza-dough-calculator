import type { ElasticStage, ProofSchedule, Stage } from "./types";

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
const rateAt = (celsius: number) => Q10 ** ((celsius - REFERENCE_CELSIUS) / 10);

const activityOfStage = ({ hours, celsius }: Stage) => hours * rateAt(celsius);

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

/**
 * Which Stage gives way when the Leavening is the locked side.
 *
 * Running the model backwards is underdetermined with more than one Stage, so one
 * of them absorbs the whole change (ADR-0003). It is the Cold Proof, which is where
 * the hours are — except on a Style that has none, where it is the Bulk.
 */
export function elasticStageOf(schedule: ProofSchedule): ElasticStage {
	return schedule.cold.hours > 0 ? "cold" : "bulk";
}

/**
 * The Proof Schedule a given Leavening asks for: the same schedule with the Elastic
 * Stage lengthened or shortened until the two sides of the model agree again.
 *
 * The Elastic Stage never goes negative. A Leavening high enough to over-ferment the
 * dough before the fridge is even reached takes that Stage to zero and stops there —
 * the app cannot un-ferment a dough, so the combination is simply out of reach.
 *
 * With no yeast at all there is no schedule to solve for — no duration ferments a
 * dough that has nothing in it — so the schedule is handed back untouched.
 */
export function scheduleFor(schedule: ProofSchedule, freshYeastPercent: number): ProofSchedule {
	if (freshYeastPercent <= 0) return schedule;

	const elastic = elasticStageOf(schedule);
	const stage = schedule[elastic];

	const required = TARGET_ACTIVITY / freshYeastPercent;
	const fromTheOthers = activityOf(schedule) - activityOfStage(stage);
	const hours = Math.max(0, (required - fromTheOthers) / rateAt(stage.celsius));

	return { ...schedule, [elastic]: { ...stage, hours } };
}

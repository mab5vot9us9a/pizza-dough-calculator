/**
 * Bake Time: the wall-clock time the user wants to be eating at. Setting one turns
 * the Proof Schedule's durations into real clock times, counted back from the bake.
 *
 * Session-only by design — a Bake Time is never encoded into a shared link, so a
 * link is as true next week as it is today (ADR-0005). Nothing here belongs to the
 * dough module: the arithmetic is calendar, not fermentation.
 */
import type { ProofSchedule } from "$lib/dough";

const MS_PER_HOUR = 60 * 60 * 1000;
const MS_PER_MINUTE = 60 * 1000;

/** The moment each part of the Proof Schedule happens at. */
export interface ScheduleClock {
	/** When to start mixing — the whole schedule counted back from the bake. */
	mix: Date;
	/** When each Stage begins. A Stage of no hours begins where the next one does. */
	stages: Record<keyof ProofSchedule, Date>;
	bake: Date;
}

/** Whole minutes: a Stage solved to 23.42 h should not read as 14:35:12. */
function toMinute(ms: number): Date {
	return new Date(Math.round(ms / MS_PER_MINUTE) * MS_PER_MINUTE);
}

/**
 * The Proof Schedule as clock times, counted back from the Bake Time so that the
 * last Stage ends exactly when the pizza goes in.
 */
export function clockTimes(schedule: ProofSchedule, bakeTime: Date): ScheduleClock {
	const bake = bakeTime.getTime();
	const warmUp = bake - schedule.warmUp.hours * MS_PER_HOUR;
	const cold = warmUp - schedule.cold.hours * MS_PER_HOUR;
	const bulk = cold - schedule.bulk.hours * MS_PER_HOUR;

	return {
		mix: toMinute(bulk),
		stages: { bulk: toMinute(bulk), cold: toMinute(cold), warmUp: toMinute(warmUp) },
		bake: toMinute(bake),
	};
}

const WEEKDAY = new Intl.DateTimeFormat("en-GB", { weekday: "short" });
const DAY_MONTH = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "short" });
const TIME = new Intl.DateTimeFormat("en-GB", {
	hour: "2-digit",
	minute: "2-digit",
	hour12: false,
});

/** Calendar days between two moments, ignoring the time of day. */
function daysApart(from: Date, to: Date): number {
	const midnight = (date: Date) =>
		new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
	return Math.round((midnight(to) - midnight(from)) / (24 * MS_PER_HOUR));
}

/**
 * A clock time carrying just enough date to be unambiguous: bare on the day of the
 * bake, named on any other day, and dated once a Proof Schedule is long enough for
 * a weekday to come round twice.
 */
export function formatClockTime(at: Date, bakeTime: Date): string {
	const days = Math.abs(daysApart(at, bakeTime));
	const time = TIME.format(at);

	if (days === 0) return time;
	if (days < 6) return `${WEEKDAY.format(at)} ${time}`;
	return `${WEEKDAY.format(at)} ${DAY_MONTH.format(at)}, ${time}`;
}

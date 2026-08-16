import { describe, expect, it } from "vitest";

import { clockTimes, formatClockTime } from "$lib/bake-time";
import type { ProofSchedule } from "$lib/dough";

/** A Proof Schedule stated the way the tests read it: hours, at whatever temperature. */
function schedule(bulk: number, cold: number, warmUp: number): ProofSchedule {
	return {
		bulk: { hours: bulk, celsius: 20 },
		cold: { hours: cold, celsius: 4 },
		warmUp: { hours: warmUp, celsius: 20 },
	};
}

/** Local time, so the tests say the same thing in every timezone. */
function at(year: number, month: number, day: number, hour: number, minute = 0): Date {
	return new Date(year, month - 1, day, hour, minute);
}

describe("clock times", () => {
	it("counts the whole Proof Schedule back from the Bake Time", () => {
		// 2 h bulk, 24 h cold, 2 h warm-up = 28 h before Saturday 18:00.
		const times = clockTimes(schedule(2, 24, 2), at(2026, 8, 15, 18));

		expect(times.mix).toEqual(at(2026, 8, 14, 14));
		expect(times.stages.bulk).toEqual(at(2026, 8, 14, 14));
		expect(times.stages.cold).toEqual(at(2026, 8, 14, 16));
		expect(times.stages.warmUp).toEqual(at(2026, 8, 15, 16));
		expect(times.bake).toEqual(at(2026, 8, 15, 18));
	});

	it("starts a Stage of no hours where the next one does", () => {
		// A Same-day dough: no Cold Proof, no Warm-up, so mixing is 5 h before the bake.
		const times = clockTimes(schedule(5, 0, 0), at(2026, 8, 15, 18));

		expect(times.mix).toEqual(at(2026, 8, 15, 13));
		expect(times.stages.cold).toEqual(at(2026, 8, 15, 18));
		expect(times.stages.warmUp).toEqual(at(2026, 8, 15, 18));
	});

	it("lands on whole minutes when a solved Stage carries a fraction of an hour", () => {
		// The Elastic Stage solves to full precision — 23.42 h, not 23 h.
		const times = clockTimes(schedule(2, 23.42, 2), at(2026, 8, 15, 18));

		expect(times.mix.getSeconds()).toBe(0);
		expect(times.mix.getMilliseconds()).toBe(0);
		expect(times.mix).toEqual(at(2026, 8, 14, 14, 35));
	});
});

describe("clock time display", () => {
	const bake = at(2026, 8, 15, 18);

	it("shows the time alone on the day of the bake", () => {
		expect(formatClockTime(at(2026, 8, 15, 16), bake)).toBe("16:00");
	});

	it("names the day when a Stage falls on another one", () => {
		expect(formatClockTime(at(2026, 8, 14, 14), bake)).toBe("Fri 14:00");
	});

	it("dates the day when the Proof Schedule runs long enough for a weekday to repeat", () => {
		expect(formatClockTime(at(2026, 8, 8, 14), bake)).toBe("Sat 8 Aug, 14:00");
	});
});

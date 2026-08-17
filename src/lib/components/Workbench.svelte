<script lang="ts">
	import { clockTimes, formatClockTime } from "$lib/bake-time";
	import AdjustableValue from "$lib/components/AdjustableValue.svelte";
	import RevertChip from "$lib/components/RevertChip.svelte";
	import {
		type DeviationField,
		type Lock,
		type Percentages,
		type ProofSchedule,
		type Recipe,
		type YeastType,
		asFreshPercent,
		copyRecipe,
		deviationsOf,
		inYeastType,
		isModified,
		resetToPreset,
		revert,
		solve,
		styleById,
		withLock,
	} from "$lib/dough";
	import { formatGrams, formatHours, formatPercent } from "$lib/format";

	import { ChevronLeft, Lock as LockIcon, Minus, Plus, RotateCcw, X } from "@lucide/svelte";

	// `recipe` is the parent's `$state` object; mutating it here is what re-solves.
	let { recipe, onback }: { recipe: Recipe; onback: () => void } = $props();

	const style = $derived(styleById(recipe.styleId));
	const solved = $derived(solve(recipe));

	/**
	 * Oil and sugar belong to the Styles that use them. The Preset decides, not the
	 * current value, so zeroing the oil on a New York hides neither the row nor the
	 * control. Flour, water and salt are in every dough there is.
	 */
	const presetUses = $derived(
		(key: keyof Percentages) => key === "hydration" || key === "salt" || style.percentages[key] > 0
	);

	const rows = $derived(
		[
			{ name: "Flour", grams: solved.flour, percent: 1, used: true },
			{ name: "Water", grams: solved.water, percent: solved.percentages.hydration, used: true },
			{ name: "Salt", grams: solved.salt, percent: solved.percentages.salt, used: true },
			{
				name: "Oil",
				grams: solved.oil,
				percent: solved.percentages.oil,
				used: presetUses("oil"),
			},
			{
				name: "Sugar",
				grams: solved.sugar,
				percent: solved.percentages.sugar,
				used: presetUses("sugar"),
			},
			{
				name: solved.yeastType === "fresh" ? "Fresh yeast" : "Dry yeast",
				grams: solved.yeast,
				percent: solved.yeastPercent,
				used: true,
			},
		].filter((row) => row.used)
	);

	/**
	 * The adjustable Baker's Percentages, and the range each may sensibly take.
	 *
	 * The ranges are deliberately wider than anyone bakes at — no bands, no snapping,
	 * no warnings — so the ends are somewhere a user never arrives at by accident
	 * rather than somewhere the app stops them.
	 *
	 * The step is what a drag can land on, so the small ingredients get a finer one:
	 * a Neapolitan's 2.8% salt has to be reachable by thumb, not only by typing.
	 */
	const CONTROLS: {
		key: keyof Percentages;
		label: string;
		min: number;
		max: number;
		step: number;
	}[] = [
		{ key: "hydration", label: "Hydration", min: 40, max: 110, step: 0.5 },
		{ key: "salt", label: "Salt", min: 0, max: 6, step: 0.1 },
		{ key: "oil", label: "Oil", min: 0, max: 30, step: 0.1 },
		{ key: "sugar", label: "Sugar", min: 0, max: 15, step: 0.1 },
	];

	const controls = $derived(CONTROLS.filter(({ key }) => presetUses(key)));

	/**
	 * The Stages, in the order the dough passes through them.
	 *
	 * Every one of them keeps its control at all times — an absent Stage is one the
	 * user can still reach for, and a control that comes and goes is worse than one
	 * reading zero.
	 */
	const DURATIONS: {
		key: keyof ProofSchedule;
		field: DeviationField;
		label: string;
		max: number;
		step: number;
	}[] = [
		{ key: "bulk", field: "bulkHours", label: "Bulk", max: 24, step: 0.5 },
		{ key: "cold", field: "coldHours", label: "Cold proof", max: 96, step: 1 },
		{ key: "warmUp", field: "warmUpHours", label: "Warm-up", max: 8, step: 0.5 },
	];

	/**
	 * The Proof Schedule as the baker walks it. A Stage of no hours is absent from the
	 * walk-through, which is how the Same-day Style reads correctly with no Cold Proof
	 * and no Warm-up.
	 *
	 * Read off the solved schedule, not the stored one: with the Leavening locked, the
	 * Elastic Stage's duration is an answer rather than an input.
	 */
	const stages = $derived(
		DURATIONS.map(({ key, label }) => ({ key, label, stage: solved.schedule[key] })).filter(
			({ stage }) => stage.hours > 0
		)
	);

	/**
	 * The Bake Time, as the `datetime-local` field holds it. Empty means unset, which
	 * is the default and stays a first-class state: the schedule reads as durations and
	 * is then true whenever the dough is made.
	 *
	 * Deliberately not part of the Recipe. It is session-only — never persisted, never
	 * encoded into a shared link (ADR-0005), so a link cannot go stale.
	 */
	let bakeTime = $state("");

	const bakeAt = $derived.by(() => {
		if (!bakeTime) return null;
		const at = new Date(bakeTime);
		return Number.isNaN(at.getTime()) ? null : at;
	});

	/** The solved schedule as clock times, or null while there is no Bake Time. */
	const clock = $derived(bakeAt ? clockTimes(solved.schedule, bakeAt) : null);

	const YEAST_TYPES: { value: YeastType; label: string }[] = [
		{ value: "fresh", label: "Fresh" },
		{ value: "dry", label: "Dry" },
	];

	/**
	 * Which end of the Leavening/Proof Schedule relationship the user is driving
	 * (ADR-0003). The other end is solved for, and its control gives way to a readout,
	 * so there is never a number on screen the app is about to overwrite.
	 */
	const LOCKS: { value: Lock; label: string }[] = [
		{ value: "schedule", label: "Proof schedule" },
		{ value: "leavening", label: "Yeast" },
	];

	const leaveningLocked = $derived(recipe.lock === "leavening");

	/** The Stage the Leavening is currently moving, named the way the copy says it. */
	const elasticLabel = $derived(
		DURATIONS.find(({ key }) => key === solved.elasticStage)!.label.toLowerCase()
	);

	/**
	 * The Style is a reference point, not a cage: every value the user has moved away
	 * from its Preset is marked with what it used to be, and can be put back.
	 */
	const deviations = $derived(deviationsOf(recipe));
	const modified = $derived(isModified(recipe));

	/**
	 * The Preset's value for a field, read in the units of the control showing it — or
	 * nothing at all when the field is still where the Style put it.
	 */
	const was = $derived((field: DeviationField): string | undefined => {
		const value = deviations[field];
		if (value === undefined) return undefined;
		if (typeof value === "string") return value === "fresh" ? "Fresh" : "Dry";

		switch (field) {
			case "count":
				return String(value);
			case "ballGrams":
				return `${value} g`;
			case "bulkHours":
			case "coldHours":
			case "warmUpHours":
				return formatHours(value);
			case "roomCelsius":
			case "fridgeCelsius":
				return `${value} °C`;
			// The Leavening reads in the yeast the baker is holding, as its control does —
			// not in the Style's, so that "was" and "is" are the same unit and comparable
			// even on a dough whose yeast type has been swapped too.
			case "leavening":
				return formatPercent(inYeastType(value, recipe.yeastType));
			// Hydration, salt, oil and sugar: Baker's Percentages, as the baker says them.
			default:
				return formatPercent(value);
		}
	});

	/**
	 * Writes a Recipe the domain handed back over the one the screen is holding.
	 *
	 * Field by field, because the screen does not own the object — the parent does, and
	 * it is what everything here re-solves from.
	 */
	function assign(next: Recipe) {
		const copy = copyRecipe(next);
		recipe.batch = copy.batch;
		recipe.percentages = copy.percentages;
		recipe.yeastType = copy.yeastType;
		recipe.schedule = copy.schedule;
		recipe.lock = copy.lock;
		recipe.freshYeastPercent = copy.freshYeastPercent;
	}

	function revertField(field: DeviationField) {
		// A duration can hand the Elastic role over, so bank what it reads first — the
		// same reason setStageHours does.
		if (DURATIONS.some((duration) => duration.field === field)) bankElasticStage();
		assign(revert(recipe, field));
	}

	function setLock(lock: Lock) {
		// Whichever side is about to become derived is seeded with what is on screen now,
		// so flipping the Lock changes nothing until the user moves something.
		assign(withLock(recipe, lock));
	}

	/**
	 * Banks what the Elastic Stage currently reads before the schedule changes around it.
	 *
	 * Which Stage is Elastic depends on whether there is a Cold Proof, so raising a
	 * zeroed one hands the role over — and the Stage handing it back becomes an input
	 * again. Without this it would come back holding the number it had before the Lock
	 * rather than the one that was on screen a moment ago.
	 */
	function bankElasticStage() {
		if (!leaveningLocked) return;
		const elastic = solved.elasticStage;
		recipe.schedule[elastic].hours = solved.schedule[elastic].hours;
	}

	function setStageHours(key: keyof ProofSchedule, hours: number) {
		bankElasticStage();
		recipe.schedule[key].hours = hours;
	}

	/** Batch numbers are what the user promised themselves; keep them sane, not clamped hard. */
	function stepCount(by: number) {
		recipe.batch.count = Math.max(1, recipe.batch.count + by);
	}

	function stepBallGrams(by: number) {
		recipe.batch.ballGrams = Math.max(1, recipe.batch.ballGrams + by);
	}
</script>

<div class="mx-auto max-w-md">
	<header class="bg-surface/95 border-line sticky top-0 z-10 border-b px-5 pt-3 pb-4 backdrop-blur">
		<div class="flex items-center gap-2">
			<button
				type="button"
				class="text-ink-muted -ml-2 flex min-w-0 items-center gap-1 pr-1 text-sm"
				onclick={onback}
			>
				<ChevronLeft class="size-4 shrink-0" aria-hidden="true" />
				<span class="truncate">{style.name}</span>
			</button>

			<!--
				The Recipe still names its Style, but it is no longer exactly that Style — and
				the whole way back to it is one tap away, alongside the name it has left behind.
			-->
			{#if modified}
				<span class="border-line text-ink-muted shrink-0 rounded-full border px-2 py-0.5 text-xs">
					modified
				</span>

				<button
					type="button"
					class="text-accent -mr-2 ml-auto flex shrink-0 items-center gap-1 pl-2 text-sm"
					onclick={() => assign(resetToPreset(recipe))}
				>
					<RotateCcw class="size-4" aria-hidden="true" />
					Reset
				</button>
			{/if}
		</div>

		<dl class="mt-1 grid grid-cols-[1fr_auto_auto] items-baseline gap-x-3 gap-y-1">
			{#each rows as row (row.name)}
				<dt class="truncate">{row.name}</dt>
				<dd class="text-ink-muted text-sm" data-numeric>{formatPercent(row.percent)}</dd>
				<dd class="text-right text-lg font-semibold tabular-nums" data-numeric>
					{formatGrams(row.grams)} g
				</dd>
			{/each}

			<dt class="border-line text-ink-muted mt-1 border-t pt-1">Total</dt>
			<dd class="border-line mt-1 border-t pt-1"></dd>
			<dd class="border-line mt-1 border-t pt-1 text-right font-semibold" data-numeric>
				{formatGrams(solved.totalGrams)} g
			</dd>
		</dl>
	</header>

	<main class="flex flex-col gap-6 px-5 py-6">
		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Batch</h2>

			<div class="border-line bg-raised flex flex-col gap-4 rounded-2xl border p-4">
				{#snippet stepper(
					label: string,
					field: DeviationField,
					value: number,
					suffix: string,
					step: (by: number) => void,
					by: number
				)}
					<div class="flex items-center justify-between gap-3">
						<span class="flex min-w-0 flex-col">
							<span class="flex items-center gap-2">
								<span class="truncate font-medium">{label}</span>
								{#if was(field) !== undefined}
									<RevertChip was={was(field)!} {label} onrevert={() => revertField(field)} />
								{/if}
							</span>
							<span class="text-ink-muted text-sm" data-numeric>{value}{suffix}</span>
						</span>
						<span class="flex items-center gap-2">
							<button
								type="button"
								class="border-line grid aspect-square place-items-center rounded-xl border"
								style="width: var(--tap-target)"
								aria-label="Fewer {label.toLowerCase()}"
								onclick={() => step(-by)}
							>
								<Minus class="size-5" aria-hidden="true" />
							</button>
							<button
								type="button"
								class="border-line grid aspect-square place-items-center rounded-xl border"
								style="width: var(--tap-target)"
								aria-label="More {label.toLowerCase()}"
								onclick={() => step(by)}
							>
								<Plus class="size-5" aria-hidden="true" />
							</button>
						</span>
					</div>
				{/snippet}

				{@render stepper("Dough balls", "count", recipe.batch.count, "", stepCount, 1)}
				{@render stepper(
					"Ball weight",
					"ballGrams",
					recipe.batch.ballGrams,
					" g",
					stepBallGrams,
					10
				)}
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Dough</h2>

			<div class="border-line bg-raised flex flex-col gap-5 rounded-2xl border p-4">
				{#each controls as control (control.key)}
					<!--
						The Recipe stores Baker's Percentages as fractions; the control works in
						the percent the baker says out loud, so the binding converts both ways.
					-->
					<AdjustableValue
						label={control.label}
						min={control.min}
						max={control.max}
						step={control.step}
						unit="%"
						was={was(control.key)}
						onrevert={() => revertField(control.key)}
						bind:value={
							() => recipe.percentages[control.key] * 100,
							(percent) => (recipe.percentages[control.key] = percent / 100)
						}
					/>
				{/each}
			</div>
		</section>

		<!--
			The locked side's counterpart: a value the app is solving for, shown where its
			control would otherwise be so the row does not jump when the Lock flips.
		-->
		{#snippet solvedValue(label: string, reading: string)}
			<div class="flex items-center justify-between gap-3">
				<span class="text-ink-muted flex items-center gap-1.5 font-medium">
					<LockIcon class="size-4" aria-hidden="true" />
					{label}
				</span>
				<span
					class="border-line bg-sunken text-ink-muted w-24 rounded-xl border px-3 py-2 text-right text-lg font-semibold"
					data-numeric
				>
					{reading}
				</span>
			</div>
		{/snippet}

		{#snippet segmented<T>(
			group: string,
			options: { value: T; label: string }[],
			current: T,
			choose: (value: T) => void
		)}
			<div
				class="border-line bg-raised flex gap-2 rounded-2xl border p-2"
				role="radiogroup"
				aria-label={group}
			>
				{#each options as option (option.value)}
					{@const selected = current === option.value}
					<button
						type="button"
						role="radio"
						aria-checked={selected}
						class="flex-1 rounded-xl px-4 font-medium {selected
							? 'bg-accent text-accent-ink'
							: 'text-ink-muted'}"
						onclick={() => choose(option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		{/snippet}

		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Locked</h2>

			{@render segmented("What stays put", LOCKS, recipe.lock, setLock)}

			<p class="text-ink-muted px-1 text-sm">
				{leaveningLocked
					? `You set the yeast; the ${elasticLabel} adjusts to suit it.`
					: "You set the proof schedule; the yeast quantity adjusts to suit it."}
			</p>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Yeast</h2>

			{@render segmented("Yeast type", YEAST_TYPES, recipe.yeastType, (value) => {
				recipe.yeastType = value;
			})}

			{#if was("yeastType") !== undefined}
				<div class="px-1">
					<RevertChip
						was={was("yeastType")!}
						label="Yeast type"
						onrevert={() => revertField("yeastType")}
					/>
				</div>
			{/if}

			<div class="border-line bg-raised flex flex-col gap-5 rounded-2xl border p-4">
				{#if leaveningLocked}
					<AdjustableValue
						label="Quantity"
						min={0.05}
						max={5}
						step={0.05}
						unit="%"
						was={was("leavening")}
						onrevert={() => revertField("leavening")}
						bind:value={
							() => inYeastType(recipe.freshYeastPercent, recipe.yeastType) * 100,
							(percent) =>
								(recipe.freshYeastPercent = asFreshPercent(percent / 100, recipe.yeastType))
						}
					/>
				{:else}
					<!-- The same field either way, so the same unit either way: the grams are
					     already in the header, a step away. -->
					{@render solvedValue("Quantity", formatPercent(solved.yeastPercent))}
				{/if}
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Proof</h2>

			<div
				class="border-line bg-raised flex items-center justify-between gap-3 rounded-2xl border p-4"
			>
				<label class="font-medium" for="bake-time">Eating at</label>
				<span class="flex items-center gap-2">
					<input
						id="bake-time"
						type="datetime-local"
						class="border-line bg-sunken rounded-xl border px-3 py-2 text-right"
						data-numeric
						bind:value={bakeTime}
					/>
					{#if bakeTime}
						<button
							type="button"
							class="border-line grid aspect-square place-items-center rounded-xl border"
							style="width: var(--tap-target)"
							aria-label="Clear the bake time"
							onclick={() => (bakeTime = "")}
						>
							<X class="size-5" aria-hidden="true" />
						</button>
					{/if}
				</span>
			</div>

			<!--
				The Proof Schedule as the baker walks it. With a Bake Time set every line
				also carries the clock time it happens at, starting with the mixing; with
				none, the durations stand alone and no date appears anywhere.
			-->
			<ol class="border-line bg-raised flex flex-col gap-3 rounded-2xl border p-4">
				{#snippet entryLine(label: string, at: Date | undefined, reading: string)}
					<span class="flex flex-col">
						<span class="font-medium">{label}</span>
						{#if at && bakeAt}
							<span class="text-ink-muted text-sm" data-numeric>
								{formatClockTime(at, bakeAt)}
							</span>
						{/if}
					</span>
					<span class="text-ink-muted text-sm" data-numeric>{reading}</span>
				{/snippet}

				{#if clock}
					<li class="flex items-baseline justify-between gap-3">
						{@render entryLine("Mix", clock.mix, "")}
					</li>
				{/if}
				{#each stages as entry (entry.key)}
					<li class="flex items-baseline justify-between gap-3">
						{@render entryLine(
							entry.label,
							clock?.stages[entry.key],
							`${formatHours(entry.stage.hours)} at ${entry.stage.celsius} °C`
						)}
					</li>
				{/each}
				<li class="border-line flex items-baseline justify-between gap-3 border-t pt-3">
					{@render entryLine("Bake", clock?.bake, style.bake)}
				</li>
			</ol>

			<div class="border-line bg-raised flex flex-col gap-5 rounded-2xl border p-4">
				{#each DURATIONS as duration (duration.key)}
					{#if leaveningLocked && duration.key === solved.elasticStage}
						<!-- The Elastic Stage: with the Leavening locked, this is what gives way. -->
						{@render solvedValue(duration.label, formatHours(solved.schedule[duration.key].hours))}
					{:else}
						<AdjustableValue
							label={duration.label}
							min={0}
							max={duration.max}
							step={duration.step}
							unit=" h"
							was={was(duration.field)}
							onrevert={() => revertField(duration.field)}
							bind:value={
								() => recipe.schedule[duration.key].hours,
								(hours) => setStageHours(duration.key, hours)
							}
						/>
					{/if}
				{/each}

				<!--
					One room temperature, not two: the Bulk and the Warm-up both happen on the
					same worktop, and a February kitchen is cold for both of them.
				-->
				<AdjustableValue
					label="Room temp"
					min={10}
					max={35}
					step={0.5}
					unit=" °C"
					was={was("roomCelsius")}
					onrevert={() => revertField("roomCelsius")}
					bind:value={
						() => recipe.schedule.bulk.celsius,
						(celsius) => {
							recipe.schedule.bulk.celsius = celsius;
							recipe.schedule.warmUp.celsius = celsius;
						}
					}
				/>
				<AdjustableValue
					label="Fridge temp"
					min={0}
					max={12}
					step={0.5}
					unit=" °C"
					was={was("fridgeCelsius")}
					onrevert={() => revertField("fridgeCelsius")}
					bind:value={recipe.schedule.cold.celsius}
				/>
			</div>
		</section>

		<!-- Deliberate breathing room: the sticky header must have something to scroll over. -->
		<div class="h-32"></div>
	</main>
</div>

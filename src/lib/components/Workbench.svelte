<script lang="ts">
	import AdjustableValue from "$lib/components/AdjustableValue.svelte";
	import { type Percentages, type Recipe, type YeastType, solve, styleById } from "$lib/dough";
	import { formatGrams, formatHours, formatPercent } from "$lib/format";

	import { ChevronLeft, Minus, Plus } from "@lucide/svelte";

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
	 * The Proof Schedule as the baker walks it. A Stage of no hours is absent from the
	 * walk-through, which is how the Same-day Style reads correctly with no Cold Proof
	 * and no Warm-up. Its control stays put — an absent Stage is one the user can still
	 * reach for, and a control that comes and goes is worse than one reading zero.
	 */
	const stages = $derived(
		[
			{ name: "Bulk", stage: recipe.schedule.bulk },
			{ name: "Cold proof", stage: recipe.schedule.cold },
			{ name: "Warm-up", stage: recipe.schedule.warmUp },
		].filter(({ stage }) => stage.hours > 0)
	);

	const YEAST_TYPES: { value: YeastType; label: string }[] = [
		{ value: "fresh", label: "Fresh" },
		{ value: "dry", label: "Dry" },
	];

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
		<button
			type="button"
			class="text-ink-muted -ml-2 flex items-center gap-1 pr-3 text-sm"
			onclick={onback}
		>
			<ChevronLeft class="size-4" aria-hidden="true" />
			{style.name}
		</button>

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
					value: number,
					suffix: string,
					step: (by: number) => void,
					by: number
				)}
					<div class="flex items-center justify-between gap-3">
						<span class="flex flex-col">
							<span class="font-medium">{label}</span>
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

				{@render stepper("Dough balls", recipe.batch.count, "", stepCount, 1)}
				{@render stepper("Ball weight", recipe.batch.ballGrams, " g", stepBallGrams, 10)}
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
						bind:value={
							() => recipe.percentages[control.key] * 100,
							(percent) => (recipe.percentages[control.key] = percent / 100)
						}
					/>
				{/each}
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Yeast</h2>

			<div
				class="border-line bg-raised flex gap-2 rounded-2xl border p-2"
				role="radiogroup"
				aria-label="Yeast type"
			>
				{#each YEAST_TYPES as option (option.value)}
					{@const selected = recipe.yeastType === option.value}
					<button
						type="button"
						role="radio"
						aria-checked={selected}
						class="flex-1 rounded-xl px-4 font-medium {selected
							? 'bg-accent text-accent-ink'
							: 'text-ink-muted'}"
						onclick={() => (recipe.yeastType = option.value)}
					>
						{option.label}
					</button>
				{/each}
			</div>
		</section>

		<section class="flex flex-col gap-3">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Proof</h2>

			<ol class="border-line bg-raised flex flex-col gap-3 rounded-2xl border p-4">
				{#each stages as entry (entry.name)}
					<li class="flex items-baseline justify-between gap-3">
						<span class="font-medium">{entry.name}</span>
						<span class="text-ink-muted text-sm" data-numeric>
							{formatHours(entry.stage.hours)} at {entry.stage.celsius} °C
						</span>
					</li>
				{/each}
				<li class="border-line flex items-baseline justify-between gap-3 border-t pt-3">
					<span class="font-medium">Bake</span>
					<span class="text-ink-muted text-sm" data-numeric>{style.bake}</span>
				</li>
			</ol>

			<div class="border-line bg-raised flex flex-col gap-5 rounded-2xl border p-4">
				<AdjustableValue
					label="Bulk"
					min={0}
					max={24}
					step={0.5}
					unit=" h"
					bind:value={recipe.schedule.bulk.hours}
				/>
				<AdjustableValue
					label="Cold proof"
					min={0}
					max={96}
					step={1}
					unit=" h"
					bind:value={recipe.schedule.cold.hours}
				/>
				<AdjustableValue
					label="Warm-up"
					min={0}
					max={8}
					step={0.5}
					unit=" h"
					bind:value={recipe.schedule.warmUp.hours}
				/>

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
					bind:value={recipe.schedule.cold.celsius}
				/>
			</div>
		</section>

		<!-- Deliberate breathing room: the sticky header must have something to scroll over. -->
		<div class="h-32"></div>
	</main>
</div>

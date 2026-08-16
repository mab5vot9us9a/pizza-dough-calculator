<script lang="ts">
	import { type Recipe, solve, styleById } from "$lib/dough";
	import { formatGrams, formatPercent } from "$lib/format";

	import { ChevronLeft, Minus, Plus } from "@lucide/svelte";

	// `recipe` is the parent's `$state` object; mutating it here is what re-solves.
	let { recipe, onback }: { recipe: Recipe; onback: () => void } = $props();

	const style = $derived(styleById(recipe.styleId));
	const solved = $derived(solve(recipe));

	/**
	 * Oil and sugar belong to the Styles that use them. The Preset decides, not the
	 * current value, so zeroing the oil on a New York does not hide the control.
	 */
	const rows = $derived(
		[
			{ name: "Flour", grams: solved.flour, percent: 1, used: true },
			{ name: "Water", grams: solved.water, percent: solved.percentages.hydration, used: true },
			{ name: "Salt", grams: solved.salt, percent: solved.percentages.salt, used: true },
			{
				name: "Oil",
				grams: solved.oil,
				percent: solved.percentages.oil,
				used: style.percentages.oil > 0,
			},
			{
				name: "Sugar",
				grams: solved.sugar,
				percent: solved.percentages.sugar,
				used: style.percentages.sugar > 0,
			},
			{
				name: solved.yeastType === "fresh" ? "Fresh yeast" : "Dry yeast",
				grams: solved.yeast,
				percent: solved.yeastPercent,
				used: true,
			},
		].filter((row) => row.used)
	);

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

		<section class="flex flex-col gap-2">
			<h2 class="text-ink-muted text-sm font-semibold tracking-wide uppercase">Bake</h2>
			<p class="border-line bg-raised rounded-2xl border p-4">{style.bake}</p>
		</section>

		<!-- Deliberate breathing room: the sticky header must have something to scroll over. -->
		<div class="h-32"></div>
	</main>
</div>

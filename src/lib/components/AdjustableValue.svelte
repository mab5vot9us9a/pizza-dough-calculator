<script lang="ts">
	import RevertChip from "$lib/components/RevertChip.svelte";

	/**
	 * The one control for every adjustable number in the app.
	 *
	 * Dragging and typing are different tasks — "what happens if I go wetter" versus
	 * "I want exactly 63%" — so both are offered side by side: a slider for exploring,
	 * and a readout that turns into a numeric field when tapped.
	 *
	 * The control knows nothing about Baker's Percentages. It moves a number between
	 * `min` and `max`; a caller holding a fraction binds through a getter and setter.
	 */
	interface Props {
		label: string;
		value: number;
		min: number;
		max: number;
		step: number;
		/** Appended to the readout, e.g. "%" or " g". */
		unit?: string;
		/** The Preset's reading, when this value has deviated from it. */
		was?: string;
		/** Puts the Preset's value back. Offered only alongside a `was`. */
		onrevert?: () => void;
	}

	let { label, value = $bindable(), min, max, step, unit = "", was, onrevert }: Props = $props();

	const uid = $props.id();

	/** A step of 0.5 shows one decimal; a step of 1 shows none. */
	const decimals = $derived((String(step).split(".")[1] ?? "").length);
	const shown = $derived(value.toFixed(decimals));

	/** Tapping the readout swaps it for a field; it swaps back on blur or Enter. */
	let typing = $state(false);
	let draft = $state("");

	function startTyping() {
		draft = shown;
		typing = true;
	}

	function commit() {
		// A German keyboard offers a comma, and the user means a decimal point.
		const parsed = Number(draft.replace(",", "."));
		// Out-of-range typing is clamped rather than rejected: the ranges are wide
		// enough to cover anything bakeable, and silently keeping the slider and the
		// number in agreement beats arguing with the user about either.
		if (Number.isFinite(parsed) && draft.trim() !== "") {
			value = Math.min(max, Math.max(min, parsed));
		}
		typing = false;
	}

	function onkeydown(event: KeyboardEvent) {
		if (event.key === "Enter") (event.currentTarget as HTMLInputElement).blur();
		if (event.key === "Escape") typing = false;
	}
</script>

<div class="flex flex-col gap-1">
	<div class="flex items-center justify-between gap-3">
		<span class="flex min-w-0 items-center gap-2">
			<span id="{uid}-label" class="truncate font-medium">{label}</span>
			{#if was !== undefined && onrevert}
				<RevertChip {was} {label} {onrevert} />
			{/if}
		</span>

		{#if typing}
			<!-- inputmode, not type="number": it raises the decimal keypad without the
			     spinner arrows, and it lets the draft stay a string mid-edit. -->
			<input
				{@attach (node) => {
					node.focus();
					node.select();
				}}
				type="text"
				inputmode="decimal"
				class="border-accent bg-raised w-24 rounded-xl border px-3 text-right text-lg font-semibold"
				aria-label={label}
				bind:value={draft}
				onblur={commit}
				{onkeydown}
			/>
		{:else}
			<button
				type="button"
				class="border-line bg-raised w-24 rounded-xl border px-3 text-right text-lg font-semibold"
				data-numeric
				aria-label="Edit {label}"
				onclick={startTyping}
			>
				{shown}{unit}
			</button>
		{/if}
	</div>

	<input
		type="range"
		{min}
		{max}
		{step}
		bind:value
		aria-labelledby="{uid}-label"
		aria-valuetext="{shown}{unit}"
	/>
</div>

<style>
	/*
	 * A thumb big enough for a floury thumb, on a track thin enough to read. The
	 * row is padded vertically so the whole strip is a comfortable drag target
	 * without the track itself getting fat.
	 */
	input[type="range"] {
		--thumb: 1.75rem;

		width: 100%;
		height: var(--tap-target);
		background: transparent;
		appearance: none;
		touch-action: pan-y;
	}

	input[type="range"]::-webkit-slider-runnable-track {
		height: 0.375rem;
		border-radius: 999px;
		background: var(--color-sunken);
		border: 1px solid var(--color-line);
	}

	input[type="range"]::-moz-range-track {
		height: 0.375rem;
		border-radius: 999px;
		background: var(--color-sunken);
		border: 1px solid var(--color-line);
	}

	input[type="range"]::-webkit-slider-thumb {
		appearance: none;
		width: var(--thumb);
		height: var(--thumb);
		margin-top: calc((0.375rem - var(--thumb)) / 2);
		border-radius: 999px;
		background: var(--color-accent);
		border: 2px solid var(--color-raised);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
	}

	input[type="range"]::-moz-range-thumb {
		width: var(--thumb);
		height: var(--thumb);
		border-radius: 999px;
		background: var(--color-accent);
		border: 2px solid var(--color-raised);
		box-shadow: 0 1px 3px rgb(0 0 0 / 0.25);
	}
</style>

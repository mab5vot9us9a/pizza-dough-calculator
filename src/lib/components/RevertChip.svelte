<script lang="ts">
	import { RotateCcw } from "@lucide/svelte";

	/**
	 * The mark on a Deviation, and the way back from it.
	 *
	 * One control does all three things the Style-as-reference-point asks for: it is
	 * only there when the value has moved, it says what the Style asked for, and
	 * tapping it puts that value back. A fat-fingered slider costs one tap to undo,
	 * which is the whole point of per-field revert on a phone.
	 */
	interface Props {
		/** The Preset's reading, in the units of the control this sits beside. */
		was: string;
		/** The control's own label, so the button reads as a whole sentence to a screen reader. */
		label: string;
		onrevert: () => void;
	}

	let { was, label, onrevert }: Props = $props();
</script>

<button
	type="button"
	class="text-accent flex shrink-0 items-center gap-1 px-1 text-sm"
	aria-label="Revert {label} to {was}"
	onclick={onrevert}
>
	<RotateCcw class="size-3.5" aria-hidden="true" />
	<span data-numeric>was {was}</span>
</button>

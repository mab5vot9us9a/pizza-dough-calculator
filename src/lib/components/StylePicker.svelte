<script lang="ts">
	import { STYLES, type Style } from "$lib/dough";

	import { ChevronRight, Pizza } from "@lucide/svelte";

	let { onpick }: { onpick: (style: Style) => void } = $props();
</script>

<main class="mx-auto flex max-w-md flex-col gap-6 px-5 py-8">
	<header class="flex flex-col gap-2">
		<Pizza class="text-accent size-9" aria-hidden="true" />
		<h1 class="text-3xl font-semibold tracking-tight">Pizza Dough Calculator</h1>
		<p class="text-ink-muted">Pick a style to start from. You can change everything afterwards.</p>
	</header>

	<ul class="flex flex-col gap-3">
		{#each STYLES as style (style.id)}
			<li>
				<button
					type="button"
					class="border-line bg-raised hover:border-accent flex w-full items-center gap-3 rounded-2xl border px-4 py-4 text-left transition-colors"
					onclick={() => onpick(style)}
				>
					<span class="flex min-w-0 flex-col gap-0.5">
						<span class="text-lg font-semibold">{style.name}</span>
						<span class="text-ink-muted text-sm">{style.blurb}</span>
						<span class="text-ink-muted mt-1 text-sm" data-numeric>
							{style.batch.count} × {style.batch.ballGrams} g
						</span>
					</span>
					<ChevronRight class="text-ink-muted ml-auto size-5 shrink-0" aria-hidden="true" />
				</button>
			</li>
		{/each}
	</ul>
</main>

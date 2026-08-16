<script lang="ts">
	import { Pizza } from "@lucide/svelte";
</script>

<svelte:head><title>Pizza Dough Calculator</title></svelte:head>

<main class="mx-auto flex max-w-md flex-col gap-3 px-5 py-10">
	<Pizza class="text-accent size-10" aria-hidden="true" />
	<h1 class="text-3xl font-semibold tracking-tight">Pizza Dough Calculator</h1>
	<p class="text-ink-muted">
		Say how much dough you want and when you want to bake. Get gram weights and a proof schedule.
	</p>
</main>

<script lang="ts">
	import StylePicker from "$lib/components/StylePicker.svelte";
	import Workbench from "$lib/components/Workbench.svelte";
	import { type Recipe, type Style, recipeFromStyle } from "$lib/dough";

	/**
	 * The two screens of the app. Nothing is persisted yet — restoring the last
	 * session and reading a Recipe out of the URL is a later ticket.
	 */
	let recipe = $state<Recipe | null>(null);

	const pick = (style: Style) => (recipe = recipeFromStyle(style));
</script>

<svelte:head><title>Pizza Dough Calculator</title></svelte:head>

{#if recipe}
	<Workbench {recipe} onback={() => (recipe = null)} />
{:else}
	<StylePicker onpick={pick} />
{/if}

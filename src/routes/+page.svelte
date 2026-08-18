<script lang="ts">
	import { onMount } from "svelte";

	import StylePicker from "$lib/components/StylePicker.svelte";
	import Workbench from "$lib/components/Workbench.svelte";
	import { type Recipe, type Style, encodeRecipe, recipeFromStyle } from "$lib/dough";
	import { openingRecipe, rememberSession, showInUrl } from "$lib/session";

	/**
	 * The two screens of the app, and the one Recipe they are about.
	 *
	 * Nothing is on a server: the Recipe is written to the address bar as it changes,
	 * so a bookmark is a save (ADR-0005), and to localStorage, so closing the tab
	 * costs nothing.
	 */
	let recipe = $state<Recipe | null>(null);

	/**
	 * The Recipe as it arrived in a link and has not yet been edited.
	 *
	 * A link wins over the stored session on arrival, but it must not *destroy* it —
	 * so the session is left alone until this stops matching what is on screen. Not
	 * `$state`: nothing renders it, and it changes only in the effect that reads it.
	 */
	let untouchedLink: string | null = null;

	/** Nothing is written back until the app knows what it opened with. */
	let restored = $state(false);

	// After hydration, not during it: the page is prerendered, and neither the hash
	// nor localStorage exists when that HTML is built.
	onMount(() => {
		const opening = openingRecipe();
		if (opening) {
			recipe = opening.recipe;
			if (opening.fromLink) untouchedLink = encodeRecipe(opening.recipe);
		}
		restored = true;
	});

	$effect(() => {
		if (!restored) return;

		if (!recipe) {
			showInUrl(null);
			return;
		}

		const encoded = encodeRecipe(recipe);
		showInUrl(encoded);

		if (encoded === untouchedLink) return;
		untouchedLink = null;
		rememberSession(encoded);
	});

	const pick = (style: Style) => (recipe = recipeFromStyle(style));
</script>

<svelte:head><title>Pizza Dough Calculator</title></svelte:head>

{#if recipe}
	<Workbench {recipe} onback={() => (recipe = null)} />
{:else}
	<StylePicker onpick={pick} />
{/if}

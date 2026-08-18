<script lang="ts">
	import { afterNavigate } from "$app/navigation";

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

	/**
	 * Whether the address bar can be written to yet.
	 *
	 * The Recipe goes into the URL through SvelteKit's router, and the router is not
	 * ready to be written to until hydration has finished — `onMount` is part of
	 * hydration, so it is too early, and a write from there throws. The first
	 * navigation completing is the signal, one microtask later because the router
	 * finishes marking itself started immediately after announcing it.
	 *
	 * Nothing is lost by waiting: until then the URL is whatever the visitor arrived
	 * with, which is already the Recipe on screen.
	 */
	let routerReady = $state(false);

	afterNavigate(() => queueMicrotask(() => (routerReady = true)));

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

		const encoded = recipe ? encodeRecipe(recipe) : null;
		if (routerReady) showInUrl(encoded);

		if (!encoded || encoded === untouchedLink) return;
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

<script lang="ts">
	import { onMount } from "svelte";

	import { registerServiceWorker } from "$lib/pwa";

	import "./layout.css";

	let { children } = $props();

	onMount(registerServiceWorker);
</script>

{@render children()}

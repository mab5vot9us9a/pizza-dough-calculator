<script lang="ts">
	import { Check, Share2 } from "@lucide/svelte";

	/**
	 * Hands the current Recipe over as a link.
	 *
	 * The whole dough is in the URL already (ADR-0005), so there is nothing to save
	 * and nothing to upload — this only gets the address to where the baker wants it.
	 * The share sheet is the phone's own way of doing that; a desktop browser without
	 * one gets the clipboard and a word to say it worked.
	 *
	 * It takes no Recipe: the page keeps the current one in the address bar as it is
	 * adjusted, so the link to send is the address the baker is already at.
	 */
	let copied = $state(false);

	async function share() {
		const url = location.href;

		if (navigator.share) {
			// A rejected promise here is the baker closing the sheet, not a failure.
			await navigator.share({ title: "Pizza dough", url }).catch(() => {});
			return;
		}

		try {
			await navigator.clipboard.writeText(url);
			copied = true;
			setTimeout(() => (copied = false), 2000);
		} catch {
			// No clipboard permission. The link is the address bar, which is on screen.
		}
	}
</script>

<button
	type="button"
	class="text-accent -mr-2 flex shrink-0 items-center gap-1 pl-2 text-sm"
	onclick={share}
>
	{#if copied}
		<Check class="size-4" aria-hidden="true" />
		Copied
	{:else}
		<Share2 class="size-4" aria-hidden="true" />
		Share
	{/if}
</button>

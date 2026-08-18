import { type Recipe, decodeRecipe } from "$lib/dough";

/**
 * Where a Recipe lives between visits, and which one the app opens with.
 *
 * Two mechanisms, per ADR-0005. localStorage restores the last session, so closing
 * the tab costs nothing — but Safari on iOS clears it after seven days without a
 * visit, so it is not where a Recipe is *saved*. Saving is the URL: the whole Recipe
 * is in the hash, which makes the browser's own bookmark the save feature and every
 * Recipe shareable with no server.
 *
 * Everything here is called from the browser only, and everything here is defensive:
 * storage throws in a private window, and a hash is whatever someone pasted.
 */

/**
 * Versioned, so a future shape change discards old data rather than misreading it.
 *
 * The version is in the key and in what the key holds — but written once, because two
 * places to bump is one place to forget, and forgetting is exactly the misread the
 * version is there to prevent.
 */
const STORAGE_VERSION = 1;
const STORAGE_KEY = `pizza-calc.session.${STORAGE_VERSION}`;

interface StoredSession {
	version: number;
	recipe: string;
}

/**
 * The Recipe the app should open with, and whether it came from a link.
 *
 * A hash wins: tapping a link is an explicit intent and ignoring it would look
 * broken. It does not overwrite the stored session, though — that only happens once
 * the visitor edits something, so backing out of someone else's link leaves their own
 * dough where it was.
 */
export function openingRecipe(): { recipe: Recipe; fromLink: boolean } | null {
	const fromLink = recipeInUrl();
	if (fromLink) return { recipe: fromLink, fromLink: true };

	const stored = storedRecipe();
	return stored ? { recipe: stored, fromLink: false } : null;
}

/** Writes the last session. Takes the encoded Recipe: one shape to store, one to share. */
export function rememberSession(encoded: string): void {
	const session: StoredSession = { version: STORAGE_VERSION, recipe: encoded };
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
	} catch {
		// A private window with no quota. The dough is still in the URL.
	}
}

/**
 * Puts the Recipe in the address bar, or clears it when there is none.
 *
 * Replaces rather than pushes: every drag of a slider would otherwise be a history
 * entry, and the back button would walk the baker backwards through their own
 * adjustments one at a time.
 */
export function showInUrl(encoded: string | null): void {
	const url = new URL(location.href);
	url.hash = encoded ?? "";
	history.replaceState(history.state, "", url);
}

function recipeInUrl(): Recipe | null {
	const hash = location.hash.replace(/^#/, "");
	if (!hash) return null;

	// A hash is whatever was pasted, and `decodeURIComponent` throws on a half-written
	// escape like `%zz` — which is precisely the hand-mangled link that has to fall
	// back rather than take the app down with it.
	let text = hash;
	try {
		text = decodeURIComponent(hash);
	} catch {
		// Not percent-encoding. Read it as it stands; the codec will judge it.
	}

	return decodeRecipe(text);
}

function storedRecipe(): Recipe | null {
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return null;

		const session: StoredSession = JSON.parse(raw);
		if (session?.version !== STORAGE_VERSION || typeof session.recipe !== "string") return null;
		return decodeRecipe(session.recipe);
	} catch {
		return null;
	}
}

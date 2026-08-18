# Session restore and shareable links

Status: resolved
Type: task
Blocked by: Lock the Leavening

## Parent

[Pizza Dough Calculator — v1](../PRD.md)

## What to build

Both persistence mechanisms from ADR-0005, and the precedence rule between them.

localStorage restores the last session, so closing the tab costs nothing. But localStorage is
device-bound and Safari clears it after seven days without a visit — precisely the rhythm of
an app opened every other Friday — so it is not where a Recipe is *saved*. Saving is the URL:
the whole Recipe lives in the hash, which makes the browser's own bookmark system the save
feature and makes every Recipe shareable with no server.

The precedence rule is the subtle part. A hash on load wins, because tapping a link is an
explicit intent and ignoring it would look broken — but it must not destroy the stored
session until the user actually edits something, so backing out of a link leaves their own
dough intact.

Decoding must be defensive. A truncated or hand-mangled hash should fall back, never throw.

## Acceptance criteria

- [x] The current Recipe is written to localStorage under a single versioned key, so a future
      shape change can discard rather than misread old data.
- [x] Returning to the app with no hash restores the last session and skips the Style picker.
- [x] A first-time visitor with no stored session sees the Style picker.
- [x] The full Recipe encodes into the URL hash and decodes back to an equal Recipe.
- [x] Bake Time is excluded from the encoding.
- [x] Loading with a hash present shows that Recipe and leaves the stored session untouched
      until the user edits something.
- [x] Malformed, truncated or empty hashes fall back to the stored session or the picker
      without throwing.
- [x] The user can obtain a shareable link for the current Recipe.
- [x] Unit tests cover encode-decode round-trips for every Style and for Recipes carrying
      Deviations, plus defensive decoding of malformed input.

## Resolution

`src/lib/dough/codec.ts` writes a Recipe down and reads it back; `src/lib/session.ts` is the
browser side — localStorage, the address bar, and the precedence rule between them. The page
restores in `onMount` and writes back from one `$effect`. A Share button in the Workbench
header hands over the address the baker is already at.

### The link carries a checksum

Nothing in the format made a truncated link detectable: every field on its own is plausible as
some other number, so `1~0~4~250~0.62…` cut in half decodes to a real but different dough. The
acceptance criterion asks truncated hashes to *fall back*, which means noticing them, so the
payload ends in six characters of FNV-1a. It costs six characters and makes the promise a real
one: a link either gives back the dough that was sent, or gives back nothing.

### Both room temperatures are encoded

Iteration 7 asked that decoding never produce a Warm-up temperature diverging from the Bulk,
since no control exists for it. The Same-day Preset itself holds them apart — it bulks at 22 °C
and names 20 °C for the Warm-up it does not have — so clamping them together broke the
round-trip for a Style straight out of its own Preset. The link says what the Recipe says. The
gap Iteration 7 named is unchanged: a Warm-up temperature that differs is neither marked as a
Deviation nor revertible.

### Session-only Bake Time needed no work

It has not been part of the Recipe since Iteration 6, so it cannot reach a link by accident —
which was the point of putting it out of the Recipe rather than leaving a note here.

# Session restore and shareable links

Status: ready-for-agent
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

- [ ] The current Recipe is written to localStorage under a single versioned key, so a future
      shape change can discard rather than misread old data.
- [ ] Returning to the app with no hash restores the last session and skips the Style picker.
- [ ] A first-time visitor with no stored session sees the Style picker.
- [ ] The full Recipe encodes into the URL hash and decodes back to an equal Recipe.
- [ ] Bake Time is excluded from the encoding.
- [ ] Loading with a hash present shows that Recipe and leaves the stored session untouched
      until the user edits something.
- [ ] Malformed, truncated or empty hashes fall back to the stored session or the picker
      without throwing.
- [ ] The user can obtain a shareable link for the current Recipe.
- [ ] Unit tests cover encode-decode round-trips for every Style and for Recipes carrying
      Deviations, plus defensive decoding of malformed input.

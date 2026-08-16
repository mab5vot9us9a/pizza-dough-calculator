# The URL is the save mechanism

The app has no accounts and no backend, so the obvious home for a saved Recipe is localStorage. We
use it — but only to restore the last session automatically. Saving proper is done by encoding the
whole Recipe into the URL hash, which makes the browser's own bookmark system the save feature and
makes every Recipe shareable with zero server.

## Considered Options

An on-device library of named Recipes is the more familiar save model, and was rejected for v1: it
needs list, name, delete and load UI, and everything in it dies with the browser data. localStorage
alone was rejected because Safari on iOS clears script-writable storage after seven days without a
visit — precisely the usage pattern of an app opened every other Friday.

## Consequences

A hash present on load wins over the stored session, since tapping a link is an explicit intent, but
it does not overwrite the stored session until the user edits something. Bake Time is deliberately
never encoded, so shared links do not go stale.

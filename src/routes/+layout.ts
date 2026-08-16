// The whole app runs in the browser: there is nothing to render per-request, so every
// route is prerendered to plain files (ADR-0006).
export const prerender = true;
export const ssr = true;

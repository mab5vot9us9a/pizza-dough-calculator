# The app ships as a prebuilt image that the host cannot cache wrongly

CI builds the static site into a `caddy:2-alpine` image, publishes it to GHCR, and asks Coolify to
pull it. The build never runs on the deployment host, and the deployment artifact is a tagged image
rather than a git ref.

The alternative was Coolify's Static build pack, which clones the repo and serves the output with a
bundled Nginx. It was rejected because it does not let us control response headers, and for this app
the headers are a correctness requirement rather than a tuning knob.

ADR-0006 explains why the app is static. This is how it reaches a browser.

## Consequences

**The cache-header split is load-bearing.** The service worker precaches the whole build under a
`pizza-calc-<version>` cache and calls `skipWaiting()`, so a new deployment takes over on the next
load — but only if the browser re-fetches `index.html` and `service-worker.js`. Those, and
everything else that is not content-hashed, are served `no-cache`; `/_app/immutable/*` is served
immutable for a year. Get this wrong and a deploy silently never reaches anyone with the app on
their home screen, which is precisely the audience ADR-0006 was written for.

**The Coolify resource must be a Docker Image application, not a Compose one.** Only the
`dockerimage` build pack pulls unconditionally on each deploy; a Compose resource would keep running
the layer it already has. This is why `latest` is safe to point at.

**The healthcheck lives in the `Dockerfile`.** Coolify honours an image's own `HEALTHCHECK` and
otherwise generates one that needs `curl` or `wget` present in the image. Declaring it ourselves
keeps the contract in the repo and lets rolling updates wait for a container that actually serves,
rather than one that merely started.

**`try_files` stands in for a 404 page.** The adapter is configured without a `fallback`, so the
build emits no `404.html`. Any unknown path serves `index.html`, which is right for a one-route app
whose entire state lives in the URL hash (ADR-0005) and never reaches the server.

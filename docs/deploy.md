# Deploying

`main` deploys itself. A push runs the CI gate, builds a container image around the static build,
pushes it to GHCR, and asks Coolify to pull it.

```
push to main
  -> .github/workflows/ci.yml      check, lint, test:unit, build
  -> Dockerfile                    node:24-alpine builds ./build, caddy:2-alpine serves it
  -> ghcr.io/mab5vot9us9a/pizza-dough-calculator:latest  (+ :sha-<short>)
  -> POST <coolify>/api/v1/deploy  Coolify pulls and restarts
```

## Why an image rather than Coolify's static build pack

The app is a PWA. `src/service-worker.ts` precaches the whole build under a `pizza-calc-<version>`
cache and calls `skipWaiting()`, so a deploy replaces the cache on the next load — **but only if the
browser re-fetches `index.html` and `service-worker.js`**. If those are long-cached, someone with
the app on their home screen keeps the old version indefinitely.

So the hosting layer has to split cache headers: `/_app/immutable/*` immutable for a year (Vite
content-hashes those filenames), everything else `no-cache`. `Caddyfile` is where that lives, and
owning it is the reason for a purpose-built image.

## One-time Coolify setup

1. **Settings → Advanced → API Access: on.** The API route group runs an `ApiAllowed` middleware;
   with this off, every deploy call fails before reaching the controller. Leave the allowed-IP list
   empty — GitHub runners have no stable egress range.
2. **Keys & Tokens → API Tokens → Create**, with only the **`deploy`** permission (the route's
   middleware is `api.ability:deploy`). The token is shown once. Pick a real expiry and note it
   somewhere: an expired token breaks deploys with no warning from Coolify. Older builds label this
   page _Security → API Tokens_.
3. **`+ New` → Docker Image** — not Docker Compose, and not a Git-sourced resource. Only the
   `dockerimage` build pack runs `docker compose pull` unconditionally on every deploy, which is
   what makes a moving `:latest` tag actually re-resolve against the registry. A Compose resource
   runs `up -d` with no `--pull` and would serve the cached layer forever.
   - **Image Name:** `ghcr.io/mab5vot9us9a/pizza-dough-calculator`
   - **Tag:** `latest`
   - **SHA256 Digest:** leave empty — Tag and Digest are mutually exclusive.
4. **Configuration → General**
   - _Ports Exposes:_ `80` (already the default for a Docker Image app).
   - _Domains:_ `https://your.domain`.
   - Leave _Ports Mappings_ empty. Publishing a host port bypasses Traefik and disables rolling
     updates — as do _Custom Container Name_ and _Consistent Container Names_.
5. Point a DNS A record at the server, then deploy. Traefik requests the Let's Encrypt certificate
   over HTTP-01 on its own.
6. **Configuration → Webhooks** → copy the UUID out of the _"Deploy Webhook (auth required)"_ URL.
   Ignore _Manual Git Webhooks_: those are for Git-sourced resources, and this app has no Git
   source.
7. After the first successful push, make the package public: **GHCR package → Package settings →
   Danger Zone → Change visibility → Public**. Coolify has no registry-credential UI, so a private
   pull depends on `docker login ghcr.io` as the server's exact SSH user, with
   `~/.docker/config.json` bind-mounted into the coolify-helper container. GitHub cannot revert
   public → private, so this is a one-way door.

### Repository secrets

| Secret             | Value                                                              |
| ------------------ | ------------------------------------------------------------------ |
| `COOLIFY_URL`      | `https://coolify.example.com` — scheme and host, no trailing slash |
| `COOLIFY_TOKEN`    | the deploy-scoped API token from step 2                            |
| `COOLIFY_APP_UUID` | the resource UUID from step 6                                      |

## Rolling back

Every deploy also publishes an immutable `sha-<short>` tag. Coolify pulls `latest`, so to roll back,
set the resource's **Tag** field to the earlier `sha-…` and redeploy. Set it back to `latest` when
the fix ships.

## Gotchas worth knowing before debugging

- **The deploy call is POST.** Coolify's published docs still show `curl --request GET`; since
  v4.2.0 the GET route returns `405 {"message":"This endpoint has changed to a POST request."}`.
- **`force=true` does nothing here.** `force_rebuild` is only consulted in Coolify's own build
  paths, never in the Docker Image path.
- **A 200 from the API means "queued", not "live".** Deployment is async. Read the Coolify
  deployment log; the line `Pulling latest images from the registry.` is the proof that a pull
  happened rather than a cached layer being reused.
- **Architecture.** GitHub runners are amd64, so the published image is `linux/amd64`. If the
  Coolify host is ARM, add `docker/setup-qemu-action` and `platforms: linux/arm64` to the build step
  in `.github/workflows/deploy.yml`. Check with `uname -m` on the server.
- **The healthcheck is in the `Dockerfile` on purpose.** Coolify uses an image's own `HEALTHCHECK`
  when it finds one; the one it would otherwise generate needs `curl` or `wget` inside the image,
  and `caddy:2-alpine` has only BusyBox `wget`. An unhealthy container is dropped from the proxy,
  which surfaces as `404 Not Found` or `No available server`.

## Verifying the image locally

```sh
docker build -t pizza-calc:test .
docker run --rm -d --name pc-test -p 8080:80 pizza-calc:test

curl -sI localhost:8080/ | grep -i cache-control                   # no-cache
curl -sI localhost:8080/service-worker.js | grep -i cache-control  # no-cache
curl -sI localhost:8080/_app/immutable/entry/app.*.js | grep -i cache-control  # max-age=31536000, immutable
curl -so /dev/null -w '%{http_code}\n' localhost:8080/nope         # 200, SPA fallback
docker inspect --format '{{.State.Health.Status}}' pc-test         # healthy
```

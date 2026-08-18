# The app is a prerendered static site (ADR-0006), so Node is a build-time tool only: the
# runtime stage is a file server and nothing else.
FROM node:24-alpine AS build
WORKDIR /app
RUN corepack enable

# Manifests first so the dependency layer survives source-only changes. `pnpm-workspace.yaml`
# belongs here too — it carries `onlyBuiltDependencies` and marks the workspace root, and
# `.npmrc` sets `engine-strict`, which is why `engines` in package.json must admit this image.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/build /srv
EXPOSE 80

# Owned here rather than left to the host. Coolify uses an image's own HEALTHCHECK when it finds
# one, and the check it would otherwise generate needs `curl` or `wget` inside the image —
# caddy:2-alpine has only BusyBox wget. An unhealthy container is dropped from the proxy, so this
# is also what makes a rolling update wait for a working container instead of a started one.
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s \
	CMD wget -q --spider http://127.0.0.1/ || exit 1

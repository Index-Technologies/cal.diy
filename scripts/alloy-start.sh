#!/usr/bin/env bash
# Bootstrap script used by docker-compose.alloy.yaml to bring the Cal.diy web
# app up inside the Alloy dev-env sandbox.
#
# It prepares the .env files the predev env-check script expects, installs
# workspace dependencies, applies Prisma migrations, seeds the dev users, and
# finally hands off to `yarn dev` so the Next.js app starts on :3000.
set -euo pipefail

cd /workspace

ALLOY_NEXTAUTH_SECRET="${ALLOY_NEXTAUTH_SECRET:-alloy-dev-nextauth-secret-not-for-production}"
ALLOY_ENCRYPTION_KEY="${ALLOY_ENCRYPTION_KEY:-alloy-dev-encryption-key-not-for-prod}"

# --- env files ------------------------------------------------------------
# `yarn dev` runs dotenv-checker against .env.example / .env.appStore.example,
# so both files must exist before the dev server is allowed to start.
if [ ! -f .env ]; then
  cp .env.example .env
fi
if [ ! -f .env.appStore ]; then
  cp .env.appStore.example .env.appStore
fi

# Fill in the two secrets the app refuses to start without.
if grep -qE '^NEXTAUTH_SECRET=\s*$' .env; then
  sed -i "s|^NEXTAUTH_SECRET=.*$|NEXTAUTH_SECRET='${ALLOY_NEXTAUTH_SECRET}'|" .env
fi
if grep -qE '^CALENDSO_ENCRYPTION_KEY=\s*$' .env; then
  sed -i "s|^CALENDSO_ENCRYPTION_KEY=.*$|CALENDSO_ENCRYPTION_KEY='${ALLOY_ENCRYPTION_KEY}'|" .env
fi

# --- toolchain ------------------------------------------------------------
# The repo pins Yarn 4 via .yarnrc.yml's yarnPath, so we just need corepack to
# have a yarn shim on PATH. corepack is bundled with the node:22 image.
corepack enable >/dev/null 2>&1 || true

# --- workspace install ----------------------------------------------------
# Skip postinstall husky hook (no .git inside container is fine, but the hook
# is irrelevant for the dev container).
HUSKY=0 yarn install

# --- database -------------------------------------------------------------
# Wait for the postgres service (compose health check should already gate
# this, but be defensive in case of restarts).
until node -e "require('net').createConnection(5450,'127.0.0.1').on('connect',()=>process.exit(0)).on('error',()=>process.exit(1))" >/dev/null 2>&1; do
  echo "[alloy-start] waiting for postgres on :5450..."
  sleep 2
done

yarn workspace @calcom/prisma db-deploy

# Seed dev users (free@example.com / pro@example.com / admin@example.com etc.)
# Failure here is non-fatal - a partially seeded DB is still browsable.
yarn workspace @calcom/prisma db-seed || echo "[alloy-start] db-seed reported errors, continuing"

# --- start dev server -----------------------------------------------------
exec yarn dev

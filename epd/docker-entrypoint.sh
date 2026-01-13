#!/bin/sh
set -euo pipefail

echo "[entrypoint] Starting entrypoint script"

# Ensure Prisma client is generated
echo "[entrypoint] Generating Prisma client (if necessary)"
npx prisma generate || true

# Apply migrations if any; fall back to db push if deploy fails
echo "[entrypoint] SKIP_MIGRATIONS=${SKIP_MIGRATIONS:-false}"
if [ "${SKIP_MIGRATIONS:-false}" = "true" ]; then
  echo "[entrypoint] SKIP_MIGRATIONS is set to true — skipping migrations and seed"
else
  echo "[entrypoint] Applying Prisma migrations (deploy)"
  if npx prisma migrate deploy; then
    echo "[entrypoint] Migrations applied successfully"
  else
    echo "[entrypoint] migrate deploy failed, falling back to db push"
    npx prisma db push
  fi

  # Run seed script if available
  if npm run | grep -q "prisma:seed"; then
    echo "[entrypoint] Running seed script"
    npm run prisma:seed || true
  fi
fi

# Exec the CMD
echo "[entrypoint] Entrypoint finished, starting main process"
exec "$@"
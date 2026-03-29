#!/bin/sh

set -eu

log() {
  printf '%s\n' "[api] $1"
}

run_dev_bootstrap() {
  attempt=1
  max_attempts="${DB_READY_MAX_ATTEMPTS:-20}"
  retry_delay_seconds="${DB_READY_RETRY_DELAY_SECONDS:-3}"

  while true; do
    log "Applying Prisma migrations (attempt ${attempt}/${max_attempts})..."

    if yarn workspace api prisma:migrate:deploy; then
      log "Prisma migrations applied successfully."
      break
    fi

    if [ "$attempt" -ge "$max_attempts" ]; then
      log "Prisma migrations failed after ${max_attempts} attempts."
      exit 1
    fi

    attempt=$((attempt + 1))
    log "Database is not ready yet. Retrying in ${retry_delay_seconds}s..."
    sleep "$retry_delay_seconds"
  done

  log "Running development seed..."
  yarn workspace api seed
  log "Development seed completed."
}

if [ "${NODE_ENV:-production}" = "development" ]; then
  log "Development startup detected. Running migrations and seed before boot."
  run_dev_bootstrap
else
  log "Skipping automatic database bootstrap because NODE_ENV=${NODE_ENV:-production}."
fi

log "Starting Turnix API server..."
exec yarn workspace api start

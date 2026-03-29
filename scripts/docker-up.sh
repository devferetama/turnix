#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT_DIR"

echo "Starting PostgreSQL..."
docker compose up -d postgres

echo "Waiting for PostgreSQL to become healthy..."
until docker compose exec -T postgres pg_isready -U turnix -d turnix >/dev/null 2>&1; do
  sleep 2
done

echo "Building application images..."
docker compose build api web

echo "Starting API and web..."
docker compose up -d api web

echo "The API container will now apply migrations and run the development seed on startup."
echo "Follow backend bootstrap logs with: docker compose logs -f api"

echo "Turnix containers are starting."
echo "Web: http://localhost:3000"
echo "API: http://localhost:3001 (available after API bootstrap completes)"
echo "Swagger: http://localhost:3001/docs (available after API bootstrap completes)"

#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

deployment_failed() {
  local exit_code=$?
  echo "Deployment failed with exit code ${exit_code}." >&2
  if command -v docker >/dev/null 2>&1; then
    docker compose ps 2>/dev/null || true
  fi
  exit "$exit_code"
}
trap deployment_failed ERR

fail() {
  echo "Deployment failed: $*" >&2
  exit 1
}

echo "Checking deployment prerequisites..."

if ! command -v docker >/dev/null 2>&1; then
  fail "Docker is not installed or is not available in PATH."
fi

if ! docker compose version >/dev/null 2>&1; then
  fail "Docker Compose v2 is not installed. The command 'docker compose' is required."
fi

if [[ ! -f .env ]]; then
  fail "Missing root .env file. Run 'cp .env.example .env' and fill in every value."
fi

if grep -Eq '<[^>]+>|replace-me' .env; then
  fail "The .env file still contains placeholder values. Replace them before deploying."
fi

export COMPOSE_PARALLEL_LIMIT="${COMPOSE_PARALLEL_LIMIT:-1}"

echo "Validating Docker Compose configuration..."
docker compose config --quiet

echo "Building production images..."
docker compose build

echo "Starting the UmNi stack..."
docker compose up -d --remove-orphans --wait --wait-timeout 300

echo "Container status:"
docker compose ps

trap - ERR
echo "UmNi deployment completed successfully."
echo "Open http://<EC2_PUBLIC_IP_OR_DOMAIN> after allowing inbound TCP port 80."

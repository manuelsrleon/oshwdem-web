#!/usr/bin/env bash
# Lives on the server at /opt/oshwdem-live/deploy.sh
#
# Invoked ONLY as the forced command on the GitHub deploy key, so the
# arguments arrive in $SSH_ORIGINAL_COMMAND rather than as "$@". Both are
# validated strictly: that is what makes the workflow's free-text `tag`
# input safe, and what stops this key from becoming a shell.
set -euo pipefail

cd /opt/oshwdem-live

read -r _ env tag <<< "${SSH_ORIGINAL_COMMAND:-}"

case "$env" in
  prod|dev) ;;
  *) echo "refused: environment must be 'prod' or 'dev'" >&2; exit 1 ;;
esac

if [[ ! "$tag" =~ ^sha-[0-9a-f]{7,40}$ ]]; then
  echo "refused: tag must look like sha-abc1234" >&2
  exit 1
fi

var="$(printf '%s' "$env" | tr '[:lower:]' '[:upper:]')_TAG"

grep -q "^${var}=" .env || { echo "refused: ${var} missing from .env" >&2; exit 1; }
sed -i "s|^${var}=.*|${var}=${tag}|" .env

docker compose pull "$env"
docker compose up -d "$env"
docker image prune -f >/dev/null

echo "deployed ${tag} to ${env}"
docker compose ps "$env"

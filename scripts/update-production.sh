#!/bin/bash
#
# Update frontend docker and restart
#
# Usage: ./update-production <version-tag>
#

set -e

if [ $# -ne 1 ]; then
    echo "Please provide version tag as argument"
    echo "Usage: $0 <version-tag>"
    echo "See https://github.com/tradingstrategy-ai/frontend/pkgs/container/frontend"
    exit 1
fi

# Set version tag
export TS_PUBLIC_FRONTEND_VERSION_TAG="$1"

# Set project name based on directory name, or override with env var
export COMPOSE_PROJECT_NAME=${TS_PROJECT_NAME:-$(basename $(pwd))}

source ~/secrets.env

# Source local config if exists (overrides shared secrets)
if [ -f ./config.env ]; then
    source ./config.env
fi

docker compose up -d

echo "All ok"
sleep 5
docker ps --filter name="${COMPOSE_PROJECT_NAME}-frontend-1"
docker compose logs --tail=20

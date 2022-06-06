#!/bin/bash
#
# Update the production server for the frontend
#
# To test on Mac:
#
#    # TODO add necessary envs for product build here
#    # Try out build:
#    export PRODUCTION=true
#    svelte-kit sync
#    bash scripts/update-and-restart-production.sh
#
#

set -e

if [[ -z "${VITE_PUBLIC_BACKEND_URL}" ]]; then
  echo "Please load secrets.env file"
  exit 1
fi

echo "Building dependencies"
scripts/build-deps.sh

rm -rf build
npm ci

# Creates build/server.js
echo "Building frontend"
node_modules/.bin/svelte-kit build

node scripts/server.js


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

# Add the SSH deploy key needed to access the private ChartIQ repository
# on the production deployment
ssh-add ~/.ssh/chartiq-dist ~/.ssh/fonts

if [[ -z "${VITE_PUBLIC_BACKEND_URL}" ]]; then
  echo "Please load secrets.env file"
  exit 1
fi

# Build will fail without this,
# bail out early
if [[ -z "${VITE_PUBLIC_STRATEGIES}" ]]; then
  echo "VITE_PUBLIC_STRATEGIES config for trade-executor-frontend missing"
  exit 1
fi

echo "Building dependencies"
scripts/build-deps.sh

rm -rf build
npm ci

# Creates build/server.js
echo "Building frontend"
npm run build

# Start SvelteKit node-adapter at port 3000
echo "Serve"
while true ; do node scripts/server.js ; sleep 10 ; done

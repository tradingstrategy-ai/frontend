#!/bin/bash
#
# Update the production server for the frontend
#

set -e

if [[ -z "${FRONTEND_PORT}" ]]; then
  echo "Please load secrets file"
  exit 1
fi

rm -rf build
npm ci
npm install trade-executor-frontend
# TODO: Fix this - broken?
# (cd theme && npm install && npx gulp build:dist)
node_modules/.bin/svelte-kit build



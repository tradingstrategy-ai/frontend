#!/bin/bash
#
# Build submodule tracked dependencies
#

set -e

FILE=deps/theme/package.json
if [ ! -f $FILE ]; then
   echo "$FILE does exists. Missing git submodule update --recursive --init?"
   exit 1
fi


# Create the Bootstrap precompiled CSS bundle
(cd deps/theme && npm install && npx gulp build:dist)


# Needed to correctly build the executor frontend.
# On prod this comes from the pre-set env
if [ -z "VITE_PUBLIC_STRATEGIES" ]; then
  source .env
  export VITE_PUBLIC_STRATEGIES
fi

# Package trade-executor-frontend for SvelteKit
(cd deps/trade-executor-frontend && npm run build)


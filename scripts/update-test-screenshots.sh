#!/bin/bash
#
# Update playwright test screenshots
#
# Use this when you have an intended content or style change that results in
# failing tests due to screenshot differences. You should manually validate
# the new screenshots to ensure they appear as intended.
#

set -e

# Only run CI tests (skips flaky tests)
export CI=true

# install dependencies
npm install

# build frontend
npm run build

# delete old screenshots
rm -r tests/integration/*snapshots

# run integration tests
# generates snapshot for your local platform (e.g., darwin)
npm run test:integration --skip-build || true

# extract playwright version -> identity playwright docker image
playwright_version=`npm ls @playwright/test | grep playwright | cut -d '@' -f 3`
playwright_image="mcr.microsoft.com/playwright:v${playwright_version}-focal"

# run npm install in docker (for platform-specific esbuild dependency)
docker run --rm -v $(pwd):/work/ ${playwright_image} bash -c 'cd work && npm install --force'

# run integration tests in docker
# generates snapshot for CI platform (linux)
docker run -e CI --rm -v $(pwd):/work/ ${playwright_image} bash -c 'cd work && npm run test:integration --skip-build' || true

echo -e "\nNew screenshots generated:\n"
git status tests/integration | grep 'modified.*snapshots' | cut -d ':' -f 2
echo -e "\nRun the following command to confirm tests pass:\n"
echo "   npm run test:integration --skip-build"

#!/bin/bash
#
# Start SvelteKit dev server and run Cypress test suite against it
#

set -e
set -x

source .env

echo "Using Cypress integration test suite using backend server $VITE_PUBLIC_BACKEND_URL, Ghost API $VITE_PUBLIC_GHOST_API_URL"

# Kill dangling SvelteKit servers
kill -SIGKILL $(lsof -ti:3000) || true

# Kill the dev server when the bash script exits
# https://stackoverflow.com/a/2173421/315168
# trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

#install theme
cd theme && pwd
npm ci && npx gulp build:dist
cd ..

# Install Cypress
(cd tests && npm ci)

# Start dev server
# npm run dev &
if [ -e build ] ; then
  rm -rf build
fi
node_modules/.bin/svelte-kit build
node build &

PID_SVELTE=$$
echo "SvelteKit Vite server running at PID $PID_SVELTE"
sleep 3

URL=http://localhost:3000/about

# Smoke check
# Abort early if the site does not come up, don't bother with Cypress tests
# Check with the curl the site came up
curl -sSf "$URL" > /tmp/pretest.txt
if [ $? != 0 ]; then
  echo "curl could not connect to $URL"
  exit 1
fi

echo "Pretest is"
head /tmp/pretest.txt

# Run Cypress
if [ ! -z "$CYPRESS_KEY" ] ; then
  # Github CI run using Cypress web browser recorder
  (cd tests && npx cypress run --record --key $CYPRESS_KEY)
else
  (cd tests && npm run cypress:run)
fi

# Kill dev server
kill $PID_SVELTE
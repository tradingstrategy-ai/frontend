#!/bin/bash
#
# Start SvelteKit dev server and run Cypress test suite against it
#

set -e
set -x

echo "Using Cypress integration test suite using backend server $TS_PUBLIC_BACKEND_URL, Ghost API $TS_PUBLIC_GHOST_API_URL"

# This should match the value in cypress.json baseUrl
PORT=3000

# Kill dangling SvelteKit servers
kill -SIGKILL $(lsof -ti:$PORT) || true

# Kill the dev server when the bash script exits
# https://stackoverflow.com/a/2173421/315168
# trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

# Install Cypress
(cd tests && npm ci)

# Start dev server on port PORT
npm run dev -- --port=$PORT &>/dev/null &

PID_SVELTE=$$
echo "SvelteKit Vite server running at on port $PORT with PID $PID_SVELTE"
sleep 3

URL=http://localhost:$PORT/about

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

# Kill the dev server
kill -SIGKILL $(lsof -ti:$PORT) || true

exit 0

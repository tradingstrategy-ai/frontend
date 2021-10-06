#!/bin/bash

set -e

echo "Using Cypress integration test suite using backend server $VITE_PUBLIC_BACKEND_URL"

# Start dev server
npm run dev &

PID_SVELTE=$!

sleep 1

test_command='curl -sL \
    -w "%{http_code}\\n" \
    "http://localhost:3000/" \
    -o /dev/null \
    --connect-timeout 3 \
    --max-time 5'

if [ $(test_command) == "200" ] ;
then
   echo "Test server is up" ;
else
   echo "FAIL to start server"
   exit 1
fi


# Run Cypress
npm run cypress:run

# Kill dev server
kill $PID_SVELTE
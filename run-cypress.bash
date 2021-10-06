#!/bin/bash

set -e

echo "Using Cypress integration test suite using backend server $VITE_PUBLIC_BACKEND_URL"

# Start dev server
npm run dev &

PID_SVELTE=$!

# Run Cypress
npm run cypress:run

# Kill dev server
kill $PID_SVELTE
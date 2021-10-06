#!/bin/bash

set -e

# Start dev server
npm run dev &

PID_SVELTE=$!

# Run Cypress
npm run cypress:run

# Kill dev server
kill $PID_SVELTE
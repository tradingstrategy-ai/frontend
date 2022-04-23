#!/bin/bash
#
# Start SvelteKit dev server and run Cypress test suite against it
#

set -e
set -x

source .env

echo "Using Cypress integration test suite using backend server $VITE_PUBLIC_BACKEND_URL $VITE_PUBLIC_GHOST_API_URL"

# Kill the dev server when the bash script exits
# https://stackoverflow.com/a/2173421/315168
# trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

#install theme
cd theme && pwd
npm install && npx gulp build:dist
cd ..

# Start dev server
npm run dev &
PID_SVELTE=$$
echo "SvelteKit Vite server running at PID $PID_SVELTE"
sleep 3

URL=http://localhost:3000

# Smoke check
# Abort early if the site does not come up, don't bother with Cypress tests
# Check with the curl the site came up
curl -sSf $URL > /dev/null
if [ $? != 0 ]; then
  echo "curl could not connect to $URL"
  exit 1
fi


# Did not figure out why curl returns 000 in scripted, though works from the command lien
# https://stackoverflow.com/a/44364396/315168
#test_command='curl -sL -w "%{http_code}\\n" "http://localhost:3000/" -o /dev/null --connect-timeout 15 --max-time 15'

#echo $test_command
#res=`$test_command`

#if [ $res == "200" ] ; then
#   echo "Test server is up" ;
#else
#   echo "FAILED to start server"
#   exit 1
#fi


# Run Cypress
cd tests
npm install
npm run cypress:run

# Kill dev server
kill $PID_SVELTE
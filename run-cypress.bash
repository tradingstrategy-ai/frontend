#!/bin/bash
#
# Start SvelteKit dev server and run Cypress test suite against it
#

set -e
set -x

echo "Using Cypress integration test suite using backend server $VITE_PUBLIC_BACKEND_URL"

# Kill the dev server when the bash script exits
# https://stackoverflow.com/a/2173421/315168
# trap "trap - SIGTERM && kill -- -$$" SIGINT SIGTERM EXIT

#install theme
cd theme && pwd
npm install && npx gulp build:dist
cd ..

# Start dev server
echo $VITE_PUBLIC_GHOST_API_URL check
echo $VITE_PUBLIC_BACKEND_URL
npm run dev

sleep 3

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
npm run cypress:run

# Kill dev server
# kill $PID_SVELTE
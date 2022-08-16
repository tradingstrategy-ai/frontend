#!/bin/bash
#
# - Update frontend docker and restart
# - Make sure we have all environment variables set
#

set -e

if [ -z "$TS_PUBLIC_FRONTEND_VERSION_TAG" ] ; then
    echo "Please set TS_PUBLIC_FRONTEND_VERSION_TAG"
    echo "See https://github.com/tradingstrategy-ai/frontend/pkgs/container/frontend"
fi

source ~/secrets.env

docker-compose up -d

echo "All ok"
sleep 5
docker ps | grep frontend



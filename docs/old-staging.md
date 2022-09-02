# Staging

Deprecated. See [Docker info](./docker.md) for info on how to run a staging instance.

The staging frontend is available at https://pinky.tradingstrategy.ai

Staging environment is password protected to avoid search engine indexing.

The credentials are pinky / angrybird.

This will run server-side generated (SSR) pages using node.js server.

The server itself is run in a tmux session `staging`.

The staging server default port is 127.0.0.1:4000.

```shell
# Which frontend branch we want to demostrate on the staging server
STAGING_BRANCH=add-search

cd ~/staging/frontend
git checkout $STAGING_BRANCH
source ~/staging.env
npm install
(cd theme && npm install && npx gulp build:dist)
rm -rf build && node_modules/.bin/svelte-kit build && node build/index.js
```

For reserve proxy details for the staging see:

https://github.com/tradingstrategy-ai/proxy-server/blob/master/Caddyfile

## Environment example

Example `staging.env`:

```shell
export POSTGRES_PASSWORD=""
export REDIS_PASSWORD=""
export REDIS_URL="redis://:${REDIS_PASSWORD}@localhost:6379/2"
export SENDGRID_API_KEY=""
export REVUE_API_KEY=""
export WSGI_SCHEME=https
export DD_ENV="staging"
# export VITE_PUBLIC_BACKEND_URL=https://pinky.tradingstrategy.ai/api
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api
export VITE_PUBLIC_GHOST_API_URL="https://trading-strategy.ghost.io"
export VITE_PUBLIC_GHOST_CONTENT_API_KEY=4f54e499a627473f560945d524
export VITE_SITE_MODE="staging"
#export ORACLE_DATABASE="bsc_genesis"
#export BACKEND_DATABASE="bsc_backend"
#export BACKEND_PORT=4567
export FRONTEND_PORT=4000
export FRONTEND_SSR=true
export VITE_PUBLIC_TYPESENSE_API_URL=https://4relmbjhcysqztv9p-1.a1.typesense.net
export VITE_PUBLIC_TYPESENSE_API_KEY=G26ReHm1VZwTpKye2w4P5hZkmQghb6i9

```

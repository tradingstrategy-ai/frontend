# Production

This will run server-side generated (SSR) pages using node.js server.

The server default port is 3000.

```shell
screen -S frontend
export PRODUCTION=true
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api
source ~/secrets.env
npm install
(cd theme && npm install && npx gulp build:dist)
rm -rf build && node_modules/.bin/svelte-kit build && node build
```

[Port troubleshooting](https://www.tecmint.com/find-out-which-process-listening-on-a-particular-port/)

```shell
netstat -ltnp | grep -w ':80'
```

# Testing production build locally

```shell
export PRODUCTION=true
export VITE_PUBLIC_BACKEND_URL=https://tradingstrategy.ai/api
export FRONTEND_PORT=3000
export FRONTEND_ADDRESS_HEADER=X-Forwarded-For
rm -rf build && node_modules/.bin/svelte-kit build && node build
```

This launched production build at http://localhost:3000/

Then you can check e.g. HTTP headers:

```shell
wget -S http://localhost:3000
```
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
rm -rf build && node_modules/.bin/svelte-kit build && node build/index.js
```

[Port troubleshooting](https://www.tecmint.com/find-out-which-process-listening-on-a-particular-port/)

```shell
netstat -ltnp | grep -w ':80'
```

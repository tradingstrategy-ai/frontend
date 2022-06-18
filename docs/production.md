# Production

This will run server-side generated (SSR) pages using node.js server.

The server default port is 3000.

```shell
tmux -CC -L web attach
export PRODUCTION=true
source ~/secrets.env

# Re-institate SSH agent connection if needed
eval `ssh-agent`

# Add the SSH deploy key needed to access the private ChartIQ repository
# on the production deployment
ssh-add ~/.ssh/chartiq-dist ~/.ssh/fonts

cd ~/frontend
scripts/update-and-restart-production.sh
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
rm -rf build && node_modules/.bin/svelte-kit build && node build
```

This launched production build at http://localhost:3000/

Then you can check e.g. HTTP headers:

```shell
wget -S http://localhost:3000
```

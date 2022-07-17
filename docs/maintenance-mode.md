# Chain maintenance mode

A blockchain can be set for a maintenance mode in the case
its data needs to be migrated, reindexed or such.

## Setting the maintenance mode

Maintenance mode is controlled in [./src/lib/config.ts](../src/lib/config.ts) by `TS_PUBLIC_CHAINS_UNDER_MAINTENANCE` environment variable.

It is a JSON map of slug:name pairs of chains under the maintenance.

To set it:

```shell
export TS_PUBLIC_CHAINS_UNDER_MAINTENANCE='{ "binance": "BNB Chain" }'
```

- Add this to `~/secrets.env`
- Refresh the environment `source ~/secrets.env`
- Then [restart the frontend docker](./docker.md)

```shell
source ~/secrets.env
# Get from https://github.com/tradingstrategy-ai/frontend/pkgs/container/frontend
export TS_PUBLIC_FRONTEND_VERSION_TAG=v9
docker-compose up -d --force-recreate frontend
```

Check maintanance page comes up

- https://tradingstrategy.ai/trading-view/binance/pancakeswap-v2/hash-usdt-2

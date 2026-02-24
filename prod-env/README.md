Get production configs for local diagnostics

```shell
rsync -av --exclude=data "harris2-tailscale:./frontend/*" prod-env/
```

Enable for local shell:

```shell
(cd prod-env && source config.env)
pnpm run dev
```

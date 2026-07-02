# Worktrees

Git worktrees share tracked files with the main checkout, but ignored local files are separate per worktree. Before running a dev server, browser preview, or private-data test from a worktree, copy or link the local environment and data cache from the main checkout.

## Required local files

The main checkout normally has local-only files that are intentionally ignored by git:

- `.env.local` - private environment variables loaded by Vite/SvelteKit.
- `data/` - local cache for large private datasets, including `data/cleaned-vault-prices-1h.parquet`.

Without these files, vault metadata may still load if `TS_PRIVATE_TOP_VAULTS_URL` is set manually, but chart endpoints that need the historical parquet can fail with 500 responses.

## Environment variables

Copy or symlink `.env.local` from the main checkout so the worktree gets the same private server configuration:

```shell
ln -s /home/mikko/code/frontend/.env.local .env.local
```

The important vault data variables are:

```env
TS_PRIVATE_R2_ACCOUNT_ID=
TS_PRIVATE_R2_ACCESS_KEY_ID=
TS_PRIVATE_R2_SECRET_ACCESS_KEY=
TS_PRIVATE_R2_BUCKET_NAME=
TS_PRIVATE_TOP_VAULTS_URL=
TS_PRIVATE_VAULT_PRICES_PARQUET_URL=
```

R2 credentials are the canonical source for both vault metadata and the historical parquet. `TS_PRIVATE_TOP_VAULTS_URL` and `TS_PRIVATE_VAULT_PRICES_PARQUET_URL` are fallback direct URLs when R2 is not configured.

Restart the dev server after changing `.env.local`; Vite reads these values at process start.

## Data symlink

The historical vault parquet is large and is read from a path relative to the current worktree:

```text
data/cleaned-vault-prices-1h.parquet
```

Use a symlink instead of duplicating the cache:

```shell
ln -s /home/mikko/code/frontend/data data
```

This allows worktree-local endpoints such as `/trading-view/vaults/{id}/metrics` to find the same cached parquet as the main checkout.

## Checks

Confirm ignored local resources are present:

```shell
ls -l .env.local data/cleaned-vault-prices-1h.parquet
git check-ignore -v .env.local data/cleaned-vault-prices-1h.parquet
```

Confirm the running dev server inherited private environment variables:

```shell
ps -eo pid,cmd | rg 'vite|pnpm run dev'
tr '\0' '\n' < /proc/<vite-pid>/environ | rg 'TS_PRIVATE_R2_|TS_PRIVATE_TOP_VAULTS_URL|TS_PRIVATE_VAULT_PRICES_PARQUET_URL'
```

Confirm vault chart data works:

```shell
curl -s 'http://127.0.0.1:5173/trading-view/vaults/<vault-id>/metrics'
```

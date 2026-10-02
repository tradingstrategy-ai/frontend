# Server threadpool: native work and how it is bounded

The SSR server is one Node process. Everything below runs on Node's **libuv threadpool**
(`UV_THREADPOOL_SIZE`, set in `Dockerfile`), not on the event loop:

| Pool user                    | Where                                                                    | Cost per job (measured)                      |
| ---------------------------- | ------------------------------------------------------------------------ | -------------------------------------------- |
| `dns.lookup` (every `fetch`) | undici connect, incl. backend, Ghost, R2, `host.docker.internal`         | ms                                           |
| `fs` (static files, caches)  | adapter-node `sirv`, strategies snapshot                                 | ms                                           |
| **sharp / libvips**          | `/metadata-logo/**`, `/blog/image/**`, `/social-card/**`                 | 0.4 s (webp 4 MP) → 10 s (avif 36 MP)        |
| **DuckDB**                   | `/vaults/**/chart-data`, `/vaults/[id]/metrics` via `$lib/server/duckdb` | 0.1 s (one vault) → 1 s (full-file GROUP BY) |
| brotli (`zlib`)              | chart-data response caches                                               | ms                                           |

If native jobs occupy every pool thread, `dns.lookup` and `fs` queue behind them: every
server-side `fetch` fails with `UND_ERR_CONNECT_TIMEOUT`, static files 504, SSR pages 500 —
while the event loop looks idle and a port-only healthcheck stays green. `worker_threads` do
**not** help: the pool is per process. Only a separate process isolates it.

## Guards in place

- **Bulkheads** — `$lib/server/concurrency-limit` caps sharp at 2 and DuckDB at 2 concurrent
  jobs (`image-pipeline.ts`, `duckdb.ts`). With `UV_THREADPOOL_SIZE=32` at least 28 threads
  stay free for DNS and files. Keep `sum(limits) < UV_THREADPOOL_SIZE` when adding a native user.
- **Bounded jobs** — every sharp pipeline comes from `createImagePipeline()`:
  `limitInputPixels` 50 MP, `.timeout()` 10 s, `concurrency(1)`. Logos re-encoded without `w`/`h`
  are fitted into 512 px (`DEFAULT_TRANSFORM_DIMENSION`). DuckDB runs one instance with
  `threads = cores / 2` and `memory_limit = 1GB` (override with `TS_PRIVATE_DUCKDB_THREADS`,
  `TS_PRIVATE_DUCKDB_MEMORY_LIMIT`).
- **Timeouts on R2** — `$lib/r2/client` sets 5 s connect / 30 s socket-idle. Without them a
  stalled connection held `ensureVaultPricesParquet()`'s single-flight promise forever and
  blocked every DuckDB endpoint until restart.
- **Stale-while-revalidate** — `getCachedTopVaults` uses `$lib/swrCache`: one upstream fetch
  per expiry, previous feed served meanwhile.
- **`/health`** — probes `dns.lookup` + `fs.stat` on the pool with a 5 s deadline; 503 when
  starved. `docker-compose.yml` polls it (IP literal, no DNS) so autoheal/restart can act.

## Operating notes

- Set `TS_PUBLIC_BACKEND_INTERNAL_URL` to an IP literal (e.g. `http://172.17.0.1:3456`), not
  `host.docker.internal`: hostnames cost a pool lookup per connection, IPs cost nothing.
- Symptom checklist for a recurrence: container CPU pegged with the JS main thread idle,
  `UND_ERR_CONNECT_TIMEOUT` to _every_ host, `/health` 503. Capture the native stacks before
  restarting: `gdb -p <node pid> -batch -ex 'thread apply all bt 8'` (or `eu-stack -p`).
  Frames named `duckdb::`, `vips_`/`aom`, or `BrotliEncoder` identify the job.
- Next step if guards prove insufficient: move sharp + DuckDB into a second compose service
  (same image, different command) and forward to it with an 8 s deadline; the SSR process then
  has no native CPU work at all.

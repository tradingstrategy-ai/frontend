# Server threadpool: native work and how it is bounded

The SSR server is one Node process. Everything below runs on Node's **libuv threadpool**
(`UV_THREADPOOL_SIZE`, set in `Dockerfile`), not on the event loop:

| Pool user                    | Where                                                                         | Cost per job (measured)                      |
| ---------------------------- | ----------------------------------------------------------------------------- | -------------------------------------------- |
| `dns.lookup` (every `fetch`) | undici connect, incl. backend, Ghost, R2, `host.docker.internal`              | ms                                           |
| `fs` (static files, caches)  | adapter-node `sirv`, strategies snapshot                                      | ms                                           |
| **sharp / libvips**          | `/metadata-logo/**`, `/blog/image/**`, `/social-card/**`                      | 0.4 s (webp 4 MP) → 10 s (avif 36 MP)        |
| **DuckDB**                   | `/vaults/**/chart-data`, `/vaults/[id]/metrics` via `$lib/server/data-limits` | 0.1 s (one vault) → 1 s (full-file GROUP BY) |
| brotli (`zlib`)              | chart-data response caches                                                    | ms                                           |

If native jobs occupy every pool thread, `dns.lookup` and `fs` queue behind them: every
server-side `fetch` fails with `UND_ERR_CONNECT_TIMEOUT`, static files 504, SSR pages 500 —
while the event loop looks idle and a port-only healthcheck stays green. `worker_threads` do
**not** help: the pool is per process. Only a separate process isolates it.

## Guards in place

- **Bulkheads** — `$lib/server/image-pipeline` caps sharp at 2 concurrent jobs
  (`runImageJob`, built on `$lib/server/concurrency-limit`); `withDuckDbConnection()` in
  `$lib/server/data-limits` caps DuckDB at 4. With `UV_THREADPOOL_SIZE=32` at least 26 threads
  stay free for DNS and files. Keep `sum(limits) < UV_THREADPOOL_SIZE` when adding a native user.
- **Bounded jobs** — every sharp pipeline comes from `createImagePipeline()`:
  `limitInputPixels` 50 MP, `.timeout()` 10 s, `concurrency(1)`. Logos re-encoded without `w`/`h`
  are fitted into 512 px (`DEFAULT_TRANSFORM_DIMENSION`). DuckDB queries have a 90 s deadline
  that includes waiting for a slot; a query that misses it is interrupted and the endpoint
  answers 503 (see `docs/vault-data-source.md`, "Query limits").
- **Timeouts on R2** — `$lib/r2/client` sets connect and socket-idle timeouts
  (`DATA_TIMEOUT_MS`), so a stalled connection cannot hold the parquet refresh forever.
- **Warm caches** — the top vaults feed and other shared data are refreshed in the background
  (`$lib/server/warm-cache`), so page renders do not wait on R2.
- **`/health`** — probes `dns.lookup` + `fs.stat` on the pool with a 5 s deadline; 503 when
  starved. `docker-compose.yml` polls it (IP literal, no DNS). Docker only marks the container
  `unhealthy`; a restart needs a watcher such as `autoheal` on the host.

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

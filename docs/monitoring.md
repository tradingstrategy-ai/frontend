# Monitoring

## Monitoring web-top

[web-top](https://top-framework.readthedocs.io/en/latest/web-top/index.html) API endpoint is available at `tradingstrategy.ai/tracker`,
as set in [scripts/server.js](../scripts/server.js).

To show the active and complete requests:

```shell
# Get the API key
export TOP_WEB_API_KEY=...

web-top live --tracker-url="https://tradingstrategy.ai/tracker"
```

Note that this will show only frontend SSR requests and responses;
further page navigations using SvelteKit router will directly
hit backend API endpoints and does not show up in the monitoring.

### More information

See [web-top-node](https://github.com/tradingstrategy-ai/web-top-node).

## Datadog APM Tracer

The `frontend` node service includes the Datadog `dd-trace` library to
capture APM data.

The Datadog agent runs on our production host machine. The `frontend`
docker container connects to the host agent based on the following
environment variables:

```
export DD_ENV=prod
export DD_TRACE_AGENT_URL=http://host.docker.internal:8126/
export DD_DOGSTATSD_URL=udp://host.docker.internal:8125
```

### Testing with a local Datadog Agent

To test the APM integration locally, install and run the Datadog agent
and start the `frontend` Docker container with the above env variables
defined (set `DD_ENV=local`).

See _Datadog Agent_ docs below to get started. The `datadog.yaml` config
file will need to be updated with valid `api_key` and `site` values, and
the `apm_non_local_traffic` flag needs to be enabled.

### Key Datadog docs

- [Datadog Agent](https://docs.datadoghq.com/agent/)
- [Tracing Node.js Applications](https://docs.datadoghq.com/tracing/trace_collection/dd_libraries/nodejs/?tab=containers)
- [Configuring the Node.js Tracing Library](https://docs.datadoghq.com/tracing/trace_collection/library_config/nodejs/)

## SigNoz APM via OpenTelemetry

The frontend can additionally export APM traces and console logs to a
self-hosted [SigNoz](https://signoz.io/) instance over OTLP/HTTP. This runs
**in parallel** with Datadog — the dd-trace pipeline above is completely
untouched — and is entirely optional: when `OTEL_EXPORTER_OTLP_ENDPOINT` is
unset, the integration is a no-op and the service behaves exactly as before.

Implementation lives in `src/lib/server/signoz-telemetry.ts`, wired up in
`src/hooks.server.ts`.

### Architecture

Rather than running a second OpenTelemetry SDK (which would fight Sentry v9's
internally-registered global tracer provider and add another monkey-patching
layer next to dd-trace), traces piggyback on Sentry's own OTel provider:

- `openTelemetrySpanProcessors` in `Sentry.init` adds a
  `BatchSpanProcessor(OTLPTraceExporter)` to Sentry's provider.
- `tracesSampleRate` is raised to `1.0` so the exporter sees 100% of spans;
  SigNoz therefore receives every SSR request trace.
- `beforeSendTransaction` randomly drops transactions at send time so Sentry
  itself still only receives roughly the configured keep rate (default 10%).
- Sentry's provider hardcodes its resource (`service.name: "node"`), so the
  exporter substitutes the OTel-standard resource (from `OTEL_SERVICE_NAME`
  etc.) at export time.

Console logs (`console.log/info/warn/error`) are additionally bridged to OTLP
log records with the active span's trace/span IDs attached, enabling
log↔trace correlation in SigNoz. Original stdout output is preserved, so
Docker logging is unaffected.

Two known (harmless) interactions:

- dd-trace patches Node's HTTP internals before app code loads, so the
  exporter's own outbound OTLP requests to SigNoz also appear as spans in
  Datadog. This is expected noise, not a bug.
- Export is best-effort: if the SigNoz collector is unreachable, traces/logs
  beyond the internal buffer (2048 items) are silently dropped. Request
  serving is never blocked or affected.

The full design rationale (including rejected alternatives) is recorded in
`plans/reports/brainstorm-260716-1303-otel-signoz-dual-apm.md`.

### Environment variables

Only one variable is required:

| Variable                      | Required  | Description                                                                                                     |
| ----------------------------- | --------- | --------------------------------------------------------------------------------------------------------------- |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | to enable | SigNoz collector OTLP/HTTP endpoint, e.g. `http://signoz-host:4318`. Master switch — unset disables everything. |
| `OTEL_EXPORTER_OTLP_HEADERS`  | no        | Only if the collector requires auth, e.g. `signoz-ingestion-key=...`                                            |

Everything else has sane defaults in code: service name is `frontend`
(override with the standard `OTEL_SERVICE_NAME` / `OTEL_RESOURCE_ATTRIBUTES`
if ever needed), and Sentry keeps receiving ~10% of transactions
(`TS_PRIVATE_SENTRY_TRANSACTION_SAMPLE_RATE` to tune).

### Local testing

Point the exporter at any OTLP/HTTP receiver and start the dev server:

```shell
export OTEL_EXPORTER_OTLP_ENDPOINT=http://localhost:4318
pnpm run dev
```

Traces POST to `<endpoint>/v1/traces` and logs to `<endpoint>/v1/logs` as
OTLP/JSON. Verify `service.name` shows `frontend` (not `node` or
`unknown_service`) in the SigNoz services list.

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

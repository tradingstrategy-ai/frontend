# Monitoring

## Monitoring  web-top

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




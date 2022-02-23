import { typesenseConfig } from "$lib/config";
import { SearchClient } from "typesense";

export default (({ apiKey, apiUrl }) => {
  if (!apiKey || !apiUrl) return;

  const url = new URL(apiUrl);
  const host = url.hostname;
  const protocol = url.protocol.slice(0,-1);
  const port = Number.parseInt(url.port, 10) || (protocol === 'http' ? 80 : 443);
  const path = url.pathname;

  return new SearchClient({
    apiKey,
    nodes: [{ host, protocol, port, path }]
  });
})(typesenseConfig);

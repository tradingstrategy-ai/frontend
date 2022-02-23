import { typesenseConfig } from "$lib/config";
import SearchClient from "typesense/lib/Typesense/SearchClient.js";

const url = new URL(typesenseConfig.apiUrl);

const host = url.hostname;
const protocol = url.protocol.slice(0,-1);
const port = Number.parseInt(url.port, 10) || (protocol === 'http' ? 80 : 443);
const path = url.pathname;

export default new SearchClient({
  apiKey: typesenseConfig.apiKey,
  nodes: [{ host, protocol, port, path }]
});

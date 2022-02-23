import { typesenseConfig as config } from "$lib/config";
import SearchClient from "typesense/lib/Typesense/SearchClient.js";

let client;

if (config.apiKey && config.host) {
  client = new SearchClient({
    apiKey: config.apiKey,
    nodes: [{
      host: config.host,
      port: 443,
      protocol: "https"
    }],
  });
}

export default client;

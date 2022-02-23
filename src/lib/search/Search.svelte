<script>
  import { typesenseConfig as config } from "$lib/config";
  import SearchClient from "typesense/lib/Typesense/SearchClient.js";
  import { Input, ListGroup, ListGroupItem } from "sveltestrap";

  let tradingEntities;
  let isOpen = false;
  let results = [];
  const query_by = "name,token_tickers,token_names,smart_contract_addresses";

  if (config.apiKey && config.host) {
    const client = new SearchClient({
      apiKey: config.apiKey,
      nodes: [{
        host: config.host,
        port: 443,
        protocol: "https"
      }],
    });
    tradingEntities = client.collections("trading-entities").documents();
  }

  async function handleInput({ target }) {
    if (!tradingEntities) return;

    const q = target.value.trim();
    if (q === "") {
      results = [];
      return;
    }

    try {
      const response = await tradingEntities.search({ q, query_by }, {});
      results = response.hits;
    } catch (error) {
      console.error(error);
    }
  }
</script>

<div class="search-container">
  <Input
    type="search"
    placeholder="Search"
    on:focus={() => isOpen = true}
    on:blur={() => isOpen = false}
    on:input={handleInput}
  />

  {#if isOpen}
    <div class="card bg-primary shadow-soft border-light">
      {#if results.length > 0}
        <ListGroup flush>
          {#each results as { document } (document.id)}
            <ListGroupItem>{document.description}</ListGroupItem>
          {/each}
        </ListGroup>
      {:else}
        <div class="card-body">Search exchanges, tokens and pairs</div>
      {/if}
    </div>
  {/if}
</div>

<style>
  .search-container {
    position: relative;
  }

  .card {
    position: absolute;
    z-index: 1;
    top: 3rem;
    right: 0;
    width: 450px;
  }
</style>

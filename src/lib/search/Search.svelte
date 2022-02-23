<script>
  import { Fade, Input, ListGroup, ListGroupItem } from "sveltestrap";
  import tradingEntities from "./trading-entities";

  let value = "";
  let hasFocus = false;

  $: tradingEntities.search(value);

  function getLabel({ type }) {
    return type === "exchange" ? "DEX" : type;
  }
</script>

<div class="search-container">
  <Input
    type="search"
    placeholder="Search"
    bind:value
    on:focus={() => hasFocus = true}
    on:blur={() => hasFocus = false}
  />

  <Fade isOpen={hasFocus && value}>
    <div class="card bg-primary shadow-soft border-light">
      <ListGroup flush>
        {#each $tradingEntities as { document } (document.id)}
          <ListGroupItem class="result-row d-flex align-items-center">
            <div class="type badge-{document.type}">{getLabel(document)}</div>
            <div>{document.description}</div>
          </ListGroupItem>
        {:else}
          <ListGroupItem>Search exchanges, tokens and pairs</ListGroupItem>
        {/each}
      </ListGroup>
    </div>
  </Fade>
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

  .card :global(.result-row) {
    border: none;
    font-size: 0.9rem;
    font-weight: normal;
    line-height: 1.25;
    gap: 1em;
  }

  .type {
    flex: 0 0 55px;
    border-radius: 6px;
    color: white;
    font-size: 0.75rem;
    font-weight: 600;
    text-align: center;
    line-height: 1.75;
  }
</style>

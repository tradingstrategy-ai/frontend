<script>
  import { Input, ListGroup, ListGroupItem } from "sveltestrap";
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

  {#if hasFocus && value}
    <div class="card bg-primary shadow-soft border-light">
      <ListGroup flush>
        {#each $tradingEntities as { document } (document.id)}
          <ListGroupItem>
            <span class="tag {document.type}">{getLabel(document)}</span>
            {document.description}
          </ListGroupItem>
        {:else}
          <ListGroupItem>Search exchanges, tokens and pairs</ListGroupItem>
        {/each}
      </ListGroup>
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

  .card :global(.list-group-item) {
    border: none;
  }

  .tag {
    display: inline-block;
    width: 4em;
    margin-right: 0.5ex;
    border-radius: 6px;
    background-color: #666;
    color: white;
    font-size: 0.8rem;
    font-weight: 600;
    text-align: center;
  }
</style>

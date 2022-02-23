<script lang="ts">
  import tradingEntities from "./trading-entities";
  import { Fade, Input, ListGroup, ListGroupItem } from "sveltestrap";
  import ResultLineItem from "./ResultLineItem.svelte";

  let value = "";
  let hasFocus = false;

  $: tradingEntities.search(value);
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
          <ResultLineItem {document} />
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
</style>

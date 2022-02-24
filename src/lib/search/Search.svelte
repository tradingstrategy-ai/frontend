<script lang="ts">
  import tradingEntities from "./trading-entities";
  import { Fade, Input, ListGroup, ListGroupItem } from "sveltestrap";
  import ResultLineItem from "./ResultLineItem.svelte";

  let value = "";
  let hasFocus = false;

  $: tradingEntities.search(value);
</script>

<div class="search">
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
  .search {
    position: relative;
  }

  .card {
    position: absolute;
    z-index: 1;
    right: 0;
    width: 450px;
    margin-top: 5px;
  }


  @media (max-width: 768px) {
    .search {
      position: revert;
    }

    .card {
      left: 50%;
      transform: translate(-50%, 0);
    }

  }

  @media (max-width: 450px) {
    .card {
      width: 100vw;
      border-radius: 0;
      border-left-width: 0;
      border-right-width: 0;
    }
  }
</style>

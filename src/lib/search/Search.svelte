<script>
  import { Input, ListGroup, ListGroupItem } from "sveltestrap";
  import tradingEntities from "./trading-entities";

  let isOpen = false;
</script>

<div class="search-container">
  <Input
    type="search"
    placeholder="Search"
    on:focus={() => isOpen = true}
    on:blur={() => isOpen = false}
    on:input={(e) => tradingEntities.search(e.target.value)}
  />

  {#if isOpen}
    <div class="card bg-primary shadow-soft border-light">
      {#if $tradingEntities.length > 0}
        <ListGroup flush>
          {#each $tradingEntities as { document } (document.id)}
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

<script lang="ts">
  import { goto } from "$app/navigation";
  import tradingEntities from "./trading-entities";
  import { Fade, ListGroup, ListGroupItem } from "sveltestrap";
  import ResultLineItem from "./ResultLineItem.svelte";

  let value = "";
  let hasFocus = false;
  let selectedIndex = 0;
  let resultCount = 0;

  $: tradingEntities.search(value);

  $: {
    resultCount = $tradingEntities.length;
    selectedIndex = Math.min(selectedIndex, Math.max(resultCount - 1, 0));
  }

  function handleKeydown(event) {
    switch (event.key) {
      case "ArrowDown":
        selectedIndex = (selectedIndex + 1) % resultCount;
        break;
      case "ArrowUp":
        selectedIndex = (selectedIndex + resultCount - 1) % resultCount;
        break;
      case "Enter":
        gotoEntity($tradingEntities[selectedIndex].document);
        break;
      default:
        return;
    }
    event.preventDefault();
  }

  function gotoEntity({ url_path, description }) {
    if (url_path) {
      goto (url_path.replace(/^\/+/g, "/"));
    } else {
      console.log(`GOTO ${description}`);
    }
  }
</script>

<div class="search">
  <input
    type="search"
    data-cy="search"
    placeholder="search"
    autocapitalize="none"
    spellcheck="false"
    bind:value
    on:focus={() => hasFocus = true}
    on:blur={() => hasFocus = false}
    on:keydown={handleKeydown}
  />
  <Fade isOpen={hasFocus && value}>
    <div class="card bg-primary shadow-soft border-light">
      <ListGroup flush>
        {#each $tradingEntities as { document }, index (document.id)}
          <ResultLineItem
            {document}
            selected={index === selectedIndex}
            on:mouseenter={() => selectedIndex = index}
            on:pointerdown={() => gotoEntity(document)}
          />
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
    width: 100%;
    text-align: right;
  }

  .search * {
    text-align: left;
  }

  input {
    height: 32px;
    width: 100%;
    max-width: 250px;
    margin-left: auto;
    padding: 0 1ex 0 2em;
    border: 2px solid #44476a;
    border-radius: 16px;
    outline: none;
    background: rgba(255, 255, 255, 0.5) url("/images/search.svg") 1ex 55%/14px no-repeat;
    font-size: 0.8rem;
    color: #44476a;
  }

  input:focus {
    background-color: rgba(255, 255, 255, 0.75);
    box-shadow: 0 0 10px #44476a55;
  }

  input::placeholder {
    color: #44476a80;
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

    .card :global(.list-group-item) {
      border-radius: 0 !important;
    }
  }
</style>

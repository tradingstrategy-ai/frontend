<!--
@component
Display site-wide search box for use in top-nav.
- used for limited inline results; advanced search available through `/search` page
- uses (tradingstrategy/search)[https://github.com/tradingstrategy-ai/search] backend

#### Usage:
```tsx
<Search />
```
-->
<script lang="ts">
  import { goto } from "$app/navigation";
  import tradingEntities from "./trading-entities";
  import { Fade } from "sveltestrap";
  import TradingEntityHit from "./TradingEntityHit.svelte";

  let q = "";
  let hasFocus = false;
  let selectedIndex = 0;
  let resultCount = 0;

  $: tradingEntities.search({
    q,
    sort_by: ["type_rank:asc", "liquidity:desc", "_text_match:desc"],
    group_by: ["type"]
  });

  $: {
    resultCount = $tradingEntities.hits.length;
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
        goto($tradingEntities.hits[selectedIndex].document.url_path);
        break;
      default:
        return;
    }
    event.preventDefault();
  }
</script>

<div class="search">
    <input
      type="search"
      data-cy="search"
      placeholder="search"
      autocapitalize="none"
      spellcheck="false"
      bind:value={q}
      on:focus={() => hasFocus = true}
      on:blur={() => hasFocus = false}
      on:keydown={handleKeydown}
    />
    <Fade isOpen={hasFocus && q}>
        <div class="card bg-primary shadow-soft border-light">
            <ul class="list-group flush">
                {#each $tradingEntities.hits as { document }, index (document.id)}
                    <TradingEntityHit
                      {document}
                      layout="basic"
                      selected={index === selectedIndex}
                      on:mouseenter={() => selectedIndex = index}
                    />
                {/each}
                <li class="show-all list-group-item">
                    <a href="/search?q={q}" on:mousedown|preventDefault>
                      Show all results | Advanced search
                    </a>
                </li>
            </ul>
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

  .show-all {
    padding: 0;
    background-color: #d4cdc8;
  }

  .show-all a {
    display: block;
    text-align: center;
    padding: 0.5em;
    font-size: 0.75rem;
    font-weight: 500;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .show-all:hover {
    filter: brightness(0.9);
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

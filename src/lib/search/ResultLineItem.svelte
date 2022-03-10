<!--
@component
**ResultLineItem** displays a single `tradingEntity` search result line item.
Used for showing simple search results from top-nav.
- `document` object comes from `$tradingEntity.hits`
- `selected` is used for styling the currently selected result item
- forwards native `mouseenter` and `pointerdown` events

#### Usage:
```tsx
  <ResultLineItem {document} selected={true}
    on:mouseenter={handleMouseEnter} on:mouseenter={handlePointerDown} />
```
-->
<script lang="ts">
  import { determinePriceChangeClass } from "$lib/helpers/price";

  /**
   * document returned by Typesense `tradingEntity` search hits
   * see (Trading Entities Collection)[https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md]
   */
  export let document
  export let selected = false;

  const { description, type, price_change_24h } = document;
  const label = type === "exchange" ? "DEX" : type;
  const priceChangeClass = determinePriceChangeClass(price_change_24h);
  const priceChangePct = Math.abs(price_change_24h).toLocaleString("en-US", {
    style: "percent",
    minimumFractionDigits: 1
  });
</script>

<li
  class="list-group-item d-flex align-items-center"
  class:selected
  on:mouseenter
  on:pointerdown
>
  <div class="type badge-{type}">{label}</div>
  <div class="desc flex-grow-1">{description}</div>
  {#if price_change_24h !== undefined}
    <div class="price-change {priceChangeClass}">{priceChangePct}</div>
  {/if}
</li>

<style>
  li {
    border: none;
    font-size: 0.875rem;
    font-weight: normal;
    line-height: 1.25;
    gap: 1em;
    cursor: pointer;
  }

  .selected {
    background-color: #E5DFD9;
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

  .desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .price-change {
    text-align: right;
    white-space: pre;
  }

  .price-change::after {
    display: inline-block;
    width: 1.25em;
  }

  .price-change-black::after {
    content: "-";
  }

  .price-change-green::after {
    content: "▲";
  }

  .price-change-red::after {
    content: "▼";
  }
</style>
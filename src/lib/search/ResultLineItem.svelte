<script lang="ts">
  import { determinePriceChangeClass } from "$lib/helpers/price";

  export let document, selected;

  const { description, type, price_change_24h } = document;
  const label = type === "exchange" ? "DEX" : type;
  const priceChangeClass = determinePriceChangeClass(price_change_24h);

  function getPriceChangePct() {
    return Math.abs(price_change_24h * 100).toFixed(1);
  }
</script>

<li
  class="list-group-item d-flex align-items-center"
  class:selected
  on:mouseenter
  on:pointerdown
>
  <div class="type badge-{type}">{label}</div>
  <div class="flex-grow-1">{description}</div>
  {#if price_change_24h !== undefined}
    <div class="price-change {priceChangeClass}">{getPriceChangePct()}%</div>
  {/if}
</li>

<style>
  li {
    border: none;
    font-size: 0.9rem;
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
<script type="ts">
  import { ListGroupItem } from "sveltestrap";

  export let document;

  const { description, type, price_change_24h } = document;

  const label = type === "exchange" ? "DEX" : type;

  function getPriceChangePct() {
    return Math.abs(price_change_24h * 100).toFixed(1);
  }

  function getPriceChangeClass() {
    if (price_change_24h > 0) {
      return "price-change-green";
    } else if (price_change_24h < 0) {
      return "price-change-red";
    } else {
      return "";
    }
  }
</script>

<ListGroupItem class="result-line-item d-flex align-items-center">
  <div class="type badge-{type}">{label}</div>
  <div class="flex-grow-1">{description}</div>
  {#if price_change_24h !== undefined}
    <div class="price-change {getPriceChangeClass()}">{getPriceChangePct()}%</div>
  {/if}
</ListGroupItem>

<style>
  :global(.result-line-item) {
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

  .price-change {
    text-align: right;
    white-space: pre;
  }

  .price-change::after {
    display: inline-block;
    width: 1.25em;
    content: "–";
  }

  .price-change-green::after {
    content: "▲";
  }

  .price-change-red::after {
    content: "▼";
  }
</style>
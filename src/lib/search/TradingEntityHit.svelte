<!--
@component
Used for simple search results from top-nav; displays a single `$tradingEntity`
search result line item.

#### Usage:
```tsx
  <TradingEntityHit
    {document}
    layout="basic|advanced"
    selected={true}
    on:mouseenter={handleMouseEnter}
    on:pointerdown={handlePointerDown}
  />
```
-->
<script lang="ts">
  import { determinePriceChangeClass } from "$lib/helpers/price";
  import { formatDollar, formatPriceChange } from "$lib/helpers/formatters";

  const LIQUIDITY_QUALITY_THRESHOLD = 10_000;

  /**
   * object returned by Typesense `tradingEntity` search hits; see:
   * https://github.com/tradingstrategy-ai/search/blob/main/docs/trading-entities.md
   */
  export let document;
  export let layout: "basic" | "advanced";
  export let selected = false;

  const label = document.type === "exchange" ? "DEX" : document.type;
  const isBasicLayout = layout === "basic";
  const isAdvancedLayout = layout === "advanced";
  const isLowQuality = document.liquidity < LIQUIDITY_QUALITY_THRESHOLD;

  const hasTradingData = [
    document.liquidity, document.volume_24h, document.price_change_24h
  ].some(Number.isFinite);

  const priceChangeClass = determinePriceChangeClass(document.price_change_24h);
  const priceChangePct = Math.abs(document.price_change_24h)
    .toLocaleString("en-US", {
      style: "percent",
      minimumFractionDigits: 1
    });
</script>

<li
  class="list-group-item d-flex align-items-center {layout}"
  class:selected
  class:low-quality={isLowQuality}
  on:mouseenter
  on:pointerdown
>
    <div class="type badge-{document.type}">{label}</div>
    <div class="flex-grow-1">
        <div class="d-flex flex-grow-1">
            <div class="desc flex-grow-1">{document.description}</div>

            {#if isBasicLayout && !isLowQuality && Number.isFinite(document.price_change_24h)}
                <div class="price-change {priceChangeClass}">{priceChangePct}</div>
            {:else if isAdvancedLayout && hasTradingData}
                <div class="price {priceChangeClass}">{formatDollar(document.price_usd_latest)}</div>
            {/if}
        </div>

        {#if isAdvancedLayout && hasTradingData}
            <div class="secondary d-flex flex-grow-1">
                <div>
                    <dt>volume 24h:</dt>
                    <dd>{formatDollar(document.volume_24h)}</dd>
                </div>
                <div>
                    <dt>liquidity:</dt>
                    <dd>{formatDollar(document.liquidity)}</dd>
                </div>
                <div class="price-change">
                    <dd class="{priceChangeClass}">{formatPriceChange(document.price_change_24h)}</dd>
                </div>
            </div>
        {/if}
    </div>
</li>

<style>
  li {
    font-weight: normal;
    line-height: 1.25;
    gap: 1em;
    cursor: pointer;
  }

  .basic {
    border: none;
    font-size: 0.875rem;
  }

  .advanced {
    margin-bottom: 0.65em;
    padding: 20px 30px;
    border: 1px solid #ccbbab;
    border-radius: 8px;
    background-color: #fff8f2;
    font-weight: normal;
  }

  .selected {
    background-color: #E5DFD9;
  }

  .basic.low-quality {
    background-image: url("/images/quality-warning.svg");
    background-origin: content-box;
    background-position: right center;
    background-size: 16px;
    background-repeat: no-repeat;
  }

  .low-quality > * {
    opacity: 0.5;
  }

  .type {
    flex: 0 0 4.6em;
    border-radius: 6px;
    color: white;
    font-weight: 600;
    text-align: center;
  }

  .basic .type {
    font-size: 0.75rem;
    line-height: 1.75;
  }

  .advanced .type {
    font-size: 0.8em;
    line-height: 1.85;
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

  .basic .price-change::after {
    display: inline-block;
    width: 1.25em;
  }

  .basic .price-change-black::after {
    content: "-";
  }

  .basic .price-change-green::after {
    content: "▲";
  }

  .basic .price-change-red::after {
    content: "▼";
  }

  .secondary {
    justify-content: space-between;
    margin-top: 1ex;
    font-size: 0.75rem;
  }

  .secondary div {
    width: 12em;
  }

  .secondary div.price-change {
    width: 5em;
    text-align: right;
  }

  .secondary dt {
    display: inline;
    font-weight: 300;
    color: #777777;
  }

  .secondary dd {
    display: inline;
    font-weight: 500;
  }

  @media (max-width: 576px) {
    .advanced {
      margin: -1px 0 0 0;
      padding: 15px;
      font-size: 0.875rem;
      border-left: none;
      border-right: none;
      /* override bootstrap border radiuses - requires corner-specific properties */
      border-top-left-radius: 0;
      border-top-right-radius: 0;
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    .secondary div,
    .secondary div.price-change {
      width: auto;
    }
  }
</style>
<script lang="ts">
  import { determinePriceChangeClass } from "$lib/helpers/price";
  import { formatDollar, formatPriceChange } from "$lib/helpers/formatters";
  import { goto } from "$app/navigation";

  export let document;

  const {
    description, type, price_usd_latest, price_change_24h, liquidity, volume_24h, url_path
  } = document;
  const label = type === "exchange" ? "DEX" : type;
  const isPair = type === "pair";
  const priceChangeClass = determinePriceChangeClass(price_change_24h);
</script>

<li class="list-group-item d-flex align-items-center" on:click={() => goto(url_path)}>
    <div class="type badge-{type}">{label}</div>
    <div class="flex-grow-1">

      <div class="d-flex flex-grow-1">
        <div class="desc flex-grow-1">{description}</div>
        {#if isPair}
            <div class="price {priceChangeClass}">{formatDollar(price_usd_latest)}</div>
        {/if}
      </div>
      {#if isPair}
          <div class="details d-flex flex-grow-1">
              <div>
                <dt>volume 24h:</dt>
                <dd>{formatDollar(volume_24h)}</dd>
              </div>
              <div>
                <dt>liquidity:</dt>
                <dd>{formatDollar(liquidity)}</dd>
              </div>
              <div class="price-change">
                <dd class="{priceChangeClass}">{formatPriceChange(price_change_24h)}</dd>
              </div>
          </div>
      {/if}
    </div>
</li>

<style>
  li {
    max-width: 600px;
    margin-bottom: 0.65em;
    padding: 20px 30px;
    border: 1px solid #ccbbab;
    border-radius: 8px;
    background-color: #fff8f2;
    font-weight: normal;
    line-height: 1.25;
    gap: 1em;
    cursor: pointer;
  }

  .type {
    flex: 0 0 4.6em;
    border-radius: 6px;
    color: white;
    font-size: 0.8em;
    font-weight: 600;
    text-align: center;
    line-height: 1.85;
  }

  .desc {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .details {
    justify-content: space-between;
    margin-top: 1ex;
    font-size: 0.75rem;
  }

  .details div {
    width: 12em;
  }

  .details div.price-change {
    width: 5em;
    text-align: right;
  }

  .details dt {
    display: inline;
    font-weight: 300;
    color: #777777;
  }

  .details dd {
    display: inline;
    font-weight: 500;
  }

  @media (max-width: 576px) {
    li {
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

    .details div,
    .details div.price-change {
      width: auto;
    }
  }
</style>

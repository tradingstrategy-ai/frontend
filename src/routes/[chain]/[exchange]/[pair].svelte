<script context="module">
    /*
        Render the pair trading page

        - Load pair core data on the SSR.

        - Candle data loading is delayed to the client side (though in theory the first run could be done on the SSR)

        - Selected candle stick time bucket is carried over in URL fragment - this could be moved to SvelteKit routing query parameter
    */

    import { backendUrl } from '$lib/config';
    import '$lib/styles/price.css';
    import '$lib/styles/bodytext.css';

    export async function load({ page }) {

        //
        // C
        const exchange_slug = page.params.exchange;
        const chain_slug = page.params.chain;
        const pair_slug = page.params.pair;
        const encoded = new URLSearchParams({exchange_slug, chain_slug, pair_slug});
        const apiUrl = `${backendUrl}/pair-details?${encoded}`;

        console.log("Loading", page, apiUrl);

        const resp = await fetch(apiUrl);

        if(!resp.ok) {
            if(resp.status === 404) {
                return {
                    status: 404,
                    error: `Trading pair not found: ${pair_slug}`
                }
            } else {
                return {
                    status: resp.status,
                    error: new Error()
                };
            }
        }

        const pairDetails = await resp.json()

        const summary = pairDetails.summary;
        const details = pairDetails.additional_details;
        const daily = pairDetails.daily;

        console.log("Pair details", pairDetails);

        // const urlDetails = `https://matilda.tradingstrategy.ai/exchange-details?exchange_slug=${exchangeId.toLowerCase()}&chain_slug=${chain}`;
        // const urlTopPairs = `https://matilda.tradingstrategy.ai/pairs?chain_slugs=${chain}&exchange_slugs=${exchangeId.toLowerCase()}`;
        // const pairs = await fetch(urlTopPairs);
        // const exchangesPairs = await pairs.json();
        // const details = await fetch(urlDetails);
        // const exchangesDetails = await details.json();

        return {
            props: {
                exchange_slug,
                chain_slug,
                pair_slug,
                summary,
                details,
                daily
            }
        }
    }
</script>

<script>
    // import TradingViewWidget from "svelte-tradingview-widget";
    //import TablePairs from '../../../components/table_quote_summary/Table.svelte';
    // export let pairId;
    // export let chain;
    // export let exchangeId;
    // export let pairs;
    import Time from "svelte-time";
    import { formatDollar } from '$lib/helpers/formatters';
    import { formatPriceChange } from '$lib/helpers/formatters';
    import { fromHashToTimeBucket } from './TimeBucketSelector.svelte';
    import TimeBucketSelector from './TimeBucketSelector.svelte';
    import CandleStickChart from './CandleStickChart.svelte';
    import { browser } from '$app/env';

    export let exchange_slug;
    export let chain_slug;
    export let pair_slug;
    export let summary; // PairSummary OpenAPI
    export let details; // PairAdditionalDetails OpenAPI
    export let daily; // TimeSpanTradeData OpenAPI

    // Loaded candle data
    // See Candle OpenAPI
    export let candles = null;

    // Resolve the initial candle stick chart from the fragment parameter
    let hash;
    if(browser) {
        hash = window.location.hash;
    } else {
        hash = null;
    }

    export let bucket = fromHashToTimeBucket(hash);
    console.log("Got hash", hash, "bucket", bucket);

    $: console.log(`The active bucket is ${bucket}`);

    // Price text
    export const priceChangeColorClass = summary.price_change_24h >= 0 ? "price-change-green" : "prince-change-red";

</script>

<div class="container">
    <h1>
        {summary.pair_symbol} trading on
        <a href="/{chain_slug}/{exchange_slug}">{details.exchange_name}</a>
        on <a href="/{chain_slug}">{details.chain_name}</a>
    </h1>

    <p>
        <strong>{summary.pair_name}</strong> trades as <strong>{summary.pair_symbol}</strong> on <a class=body-link href="/{chain_slug}/{exchange_slug}">{details.exchange_name}</a>
        on <a class=body-link href="/{chain_slug}">{details.chain_name}</a>.
    </p>

    <p>
        The price of <strong>{summary.base_token_symbol_friendly}</strong> in <strong>{summary.pair_symbol}</strong> pair is <strong class="{priceChangeColorClass}">{formatDollar(summary.usd_price_latest)}</strong> and is
        <strong class="{priceChangeColorClass}">{formatPriceChange(summary.price_change_24h)} {summary.price_change_24h > 0 ? "up" : "down"}</strong> for the last 24h.
    </p>

    <p>
        The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong> 24h trading volume with <strong>{formatDollar(summary.usd_liquidity_latest)}</strong> liquidity available at the moment.

        The trading of {summary.pair_symbol} started at <strong><Time relative timestamp="{Date.parse(details.first_trade_at)}" /></strong>.
    </p>

    <h2>Price chart</h2>
    <TimeBucketSelector bind:activeBucket={bucket} />
    <CandleStickChart bind:candles={candles} />

    <h2>Trading pair performance</h2>

</div>  

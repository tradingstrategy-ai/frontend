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
    import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    export async function load({ page, fetch }) {

        const exchange_slug = page.params.exchange;
        const chain_slug = page.params.chain;
        const pair_slug = page.params.pair;
        const encoded = new URLSearchParams({exchange_slug, chain_slug, pair_slug});
        const apiUrl = `${backendUrl}/pair-details?${encoded}`;

        const resp = await fetch(apiUrl);

        if(!resp.ok) {
            if(resp.status === 404) {
                console.error("Pair missing", pair_slug)
                return {
                    status: 404,
                    error: `Trading pair not found: ${pair_slug}`
                }
            } else {
                console.error("Failed to load pair", apiUrl);
                return {
                    status: resp.status,
                    error: new Error(`Could not load data for trading pair: ${apiUrl}. See console for details.`)
                };
            }
        }

        const pairDetails = await resp.json()

        const summary = pairDetails.summary;
        const details = pairDetails.additional_details;
        const daily = pairDetails.daily;

        console.log("Summary", summary);
        console.log("Details", details);

        const readableNames = {
            ...breadcrumbTranslations,
            [exchange_slug]: details.exchange_name,
            [pair_slug]: pairDetails.summary.pair_name
        };

        return {
            props: {
                exchange_slug,
                chain_slug,
                pair_slug,
                summary,
                details,
                daily,
				breadcrumbs: buildBreadcrumbs(page.path, readableNames)
            }
        }
    }
</script>

<script lang="ts">

    import Time from "svelte-time";
    import { formatDollar } from '$lib/helpers/formatters';
    import { formatPriceChange } from '$lib/helpers/formatters';
    import { fromHashToTimeBucket } from '$lib/chart/TimeBucketSelector.svelte';
    import { browser } from '$app/env';

    import TimeBucketSelector from '$lib/chart/TimeBucketSelector.svelte';
    import CandleStickChart from '$lib/chart/CandleStickChart.svelte';
    import TimeSpanPerformance from '$lib/chart/TimeSpanPerformance.svelte';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';

    export let exchange_slug;
    export let chain_slug;
    export let pair_slug;
    export let summary; // PairSummary OpenAPI
    export let details; // PairAdditionalDetails OpenAPI
    export let breadcrumbs;

    export let hourly, daily, weekly, monthly; // TimeSpanTradeData OpenAPI

    // Candle data array loaded from the server
    export let rawCandles = [];

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

    /**
     * Convert candle data to internal uPlot format.
     *
     * Candles from from the server as descripted in OpenAPI
     * https://tradingstrategy.ai/api/explorer/
     *
     * The server returns one list of JavaScript objects (o, h, l, c, v).
     * uPlot wants x-array (time) and five separate y arrays (o, h, l, c, v).
     *
     */
    function massageCandles(candles: any[]): number[][] {
        const cols = candles.length;
        const rows = 6;

        // Try to be smart and hint typed arrays and length for JavaScript VM
        // So sad JavaScript can't do even this basic shit.
        // https://stackoverflow.com/a/68411296/315168
        let matrix = Array(rows).fill().map(entry => Array(cols))

        candles.forEach(function(obj: any, idx: number) {

            // Time series
            const unixTime = Date.parse(obj.ts) / 1000;
            matrix[0][idx] = unixTime;

            // OHLCV core data
            matrix[1][idx] = obj.o;
            matrix[2][idx] = obj.h;
            matrix[3][idx] = obj.l;
            matrix[4][idx] = obj.c;
            matrix[5][idx] = obj.v;
            //matrix[5][idx] = 0
        });

        return matrix;
    }

    /**
     * Reload new candle data from the server and update the candle stick chart compontent.
     *
     * @param bucket
     */
    async function reloadCandlesOnBucketChange(bucket: string) {

        if(!bucket) {
            // Only start loading after we get a valid bucket on the client side
            return;
        }

        // Switch to skeleton loader on the candle view
        candles = null;

        // https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
        const params = {
            pair_id: summary.pair_id,
            time_bucket: bucket,
        }

        const encoded = new URLSearchParams(params);
        const apiUrl = `${backendUrl}/candles?${encoded}`;

        // console.log("Fetching candles for bucket", bucket, apiUrl);

        const resp = await fetch(apiUrl);
        if(!resp.ok) {
            console.error(resp);
            return;
        }

        const rawCandles = await resp.json();

        if(rawCandles) {
            // We have some candles for this time period
            candles = massageCandles(rawCandles);
        } else {
            candles = [];
        }

    }

    export let bucket = fromHashToTimeBucket(hash);
    // console.log("Got hash", hash, "bucket", bucket);
    // $: console.log(`The active bucket is ${bucket}`);

    // Leave room for Trade now?
    export let tradingLink = details.trade_link
    export let splashColClass = tradingLink ? "col-md-8" : "col-md-12";

    // console.log("Trading link", tradingLink);

    // Price text
    $: priceChangeColorClass = summary.price_change_24h >= 0 ? "price-change-green" : "price-change-red";

    $: reloadCandlesOnBucketChange(bucket);

</script>

<svelte:head>
	<title>
        {summary.pair_symbol} trading on {details.exchange_name} on {details.chain_name}
    </title>
	<meta name="description" content={"Price chart and technical analysis for trading " + summary.pair_symbol + " on " + details.exchange_name + " on " + details.chain_name}>
</svelte:head>

<div class="container">

    <Breadcrumb breadcrumbs={breadcrumbs} />

    <div class="text-section">

        <div class="row">
            <div class="col-md-12">
                <h1>
                    {summary.pair_symbol} trading on
                    <a href="/trading-view/{chain_slug}/{exchange_slug}">{details.exchange_name} </a>
                    on <a href="/trading-view/{chain_slug}">{details.chain_name}</a>
                </h1>
            </div>
        </div>

        <div class="row">
            <div class="col-md-12">

                <p>
                    The trading pair <strong>{summary.pair_name}</strong> trades as the ticker <strong>{summary.pair_symbol}</strong> on <a class=body-link href="/trading-view/{chain_slug}/{exchange_slug}">{details.exchange_name} exchange</a>
                    on <a class=body-link href="/trading-view/{chain_slug}">{details.chain_name} blockchain</a>.
                </p>

                <p>
                    The price of <strong>{summary.base_token_symbol_friendly}</strong> in <strong>{summary.pair_symbol}</strong> pair is <strong class="{priceChangeColorClass}">{formatDollar(summary.usd_price_latest)}</strong> and is
                    <strong class="{priceChangeColorClass}">{formatPriceChange(summary.price_change_24h)} {summary.price_change_24h > 0 ? "up" : "down"}</strong> for the last 24h.
                </p>

                <p>
                    The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong> 24h trading volume with <strong>{formatDollar(summary.usd_liquidity_latest)}</strong> liquidity available at the moment.

                    The trading of {summary.pair_symbol} started at <strong><Time relative timestamp="{Date.parse(details.first_trade_at)}" /></strong>.
                </p>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="trade-actions">
                <a href={details.buy_link} class="btn btn-primary">Buy {summary.base_token_symbol}</a>
                <a href={details.sell_link} class="btn btn-primary">Sell {summary.base_token_symbol}</a>
                <a href={details.explorer_link} class="btn btn-primary">Blockchain explorer</a>
            </div>
        </div>
    </div>

    <h2>{summary.pair_symbol} price chart</h2>

    <TimeBucketSelector bind:activeBucket={bucket} />

    <div class="chart-wrapper">
        <CandleStickChart title={summary.pair_name + "(as USD)"} bind:candles={candles} />
    </div>


    <h2>Price and liquidity movement</h2>

    <p>
        The price and liquidity of <strong>{summary.base_token_symbol_friendly}</strong> in this trading pair. The amounts are converted to US dollar through  <strong>{summary.quote_token_symbol_friendly}/USD</strong>.
    </p>

    <div class="row">
        <div class="col-lg-3 col-md-6">
            <div class="time-span-wrapper">
                <TimeSpanPerformance pairId={summary.pair_id} title="Hourly" timeSpanTradeData={hourly} period="hourly"/>
            </div>
        </div>
        <div class="col-lg-3 col-md-6">
            <div class="time-span-wrapper">
                <TimeSpanPerformance pairId={summary.pair_id} title="Daily" timeSpanTradeData={daily} period="daily"/>
            </div>
        </div>
        <div class="col-lg-3 col-md-6">
            <div class="time-span-wrapper">
                <TimeSpanPerformance pairId={summary.pair_id} title="Weekly" timeSpanTradeData={weekly} period="weekly" />
            </div>
        </div>
        <div class="col-lg-3 col-md-6">
            <div class="time-span-wrapper">
                <TimeSpanPerformance pairId={summary.pair_id} title="Monthly" timeSpanTradeData={monthly} period="monthly" />
            </div>
        </div>
    </div>

</div>

<style>

    /* Decrease the main heading font size so we can fit
      BNB-BUSD trading on PancakeSwap v2 on Binance Smart Chain on a single row

      Note that 2rem is different size for Firefox and Chrome
     */
    h1 {
        font-size: 2rem;
    }

    h2 {
        font-size: 2rem;
    }

    .text-section {
        margin-top: 20px;
    }

    .chart-wrapper {
        margin: 20px 0;
    }

    .time-span-wrapper {
        margin: 0 auto;
    }

    .card-trade {
        margin-bottom: 20px;
    }

    .trade-actions {
        margin: 20px 0;
    }

    .trade-actions .btn {
        margin-right: 20px;
    }
</style>

<script context="module">
    /*
        Render the pair trading page

        - Load pair core data on the SSR.

        - Candle data loading is delayed to the client side (though in theory the first run could be done on the SSR)

        - Selected candle stick time bucket is carried over in URL fragment - this could be moved to SvelteKit routing query parameter
    */

    import { backendUrl } from '$lib/config';

    import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";
    import {getTokenTaxInformation} from "$lib/helpers/tokentax";

    /**
     * On the server-side, we load only pair details.
     *
     * All charting data fetches are done on the client side.
     */
    export async function load({ url, params, fetch }) {

        const exchange_slug = params.exchange;
        const chain_slug = params.chain;
        const pair_slug = params.pair;
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

        const tokenTax = getTokenTaxInformation(details);

        console.log("Token tax", tokenTax);

        return {
            // Cache the pair data pages for 30 minutes at the Cloudflare edge,
            // so the pages are served really fast if they get popular,
            // and also for speed test
            maxage: 30*60, // 30 minutes,
            props: {
                exchange_slug,
                chain_slug,
                pair_slug,
                summary,
                details,
                daily,
				breadcrumbs: buildBreadcrumbs(url.pathname, readableNames),
                tokenTax,
            }
        }
    }
</script>

<script lang="ts">

    import {formatDollar, formatUnixTimestamp, parseUTCTime, formatTimeAgo} from '$lib/helpers/formatters';
    import { formatPriceChange } from '$lib/helpers/formatters';
    import TimeBucketSelector, { fromHashToTimeBucket } from '$lib/chart/TimeBucketSelector.svelte';
    import { browser } from '$app/env';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
    import PairInfoTable from "$lib/content/PairInfoTable.svelte";
    import {onMount} from "svelte";
    import CandleStickChart from "$lib/chart/CandleStickChart.svelte";
    import LiquidityChart from "$lib/chart/LiquidityChart.svelte";
    import TimeSpanPerformance from "$lib/chart/TimeSpanPerformance.svelte";
    import RelativeDate from "$lib/blog/RelativeDate.svelte";
    import type { TokenTax } from "$lib/helpers/tokentax";

    export let exchange_slug;
    export let chain_slug;
    export let summary; // PairSummary OpenAPI
    export let details; // PairAdditionalDetails OpenAPI
    export let breadcrumbs;
    export let tokenTax: TokenTax;

    export let hourly, daily, weekly, monthly; // TimeSpanTradeData OpenAPI

    // Candle data array loaded from the server
    export let rawCandles = [];

    // XYLiquidity data array loaded from the server
    export let rawLiquidity = [];

    // Candle data massaged for uPlot
    export let candles = null;

    // Liquidity data massaged for uPlot
    export let liquidity = null;

    // Loaded uPlot library
    export let uPlot;

    // Resolve the initial candle stick chart from the fragment parameter
    let hash;
    if(browser) {
        hash = window.location.hash;
    } else {
        hash = null;
    }

    /**
     * We can only import uPlot on the client side.
     */
    onMount(async () => {
        // https://stackoverflow.com/questions/57030895/whats-the-best-way-to-run-some-code-only-client-side
        if (browser) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports
            const uplotModule = await import('uplot');
            // console.log("uPlot imported dynamically", uplotModule, uplotModule.default);
            // This will trigger candle redraw if candles data was raced faster than uplot
            uPlot = uplotModule.default;
        }
    });

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
        const rows = 10;

        // Try to be smart and hint typed arrays and length for JavaScript VM
        // So sad JavaScript can't do even this basic shit.
        // https://stackoverflow.com/a/68411296/315168
        let matrix = Array(rows).fill().map(entry => Array(cols))

        candles.forEach(function(obj: any, idx: number) {

            // Time series
            const unixTime = parseUTCTime(obj.ts);
            matrix[0][idx] = unixTime;

            // OHLCV core data
            matrix[1][idx] = obj.o;
            matrix[2][idx] = obj.h;
            matrix[3][idx] = obj.l;
            matrix[4][idx] = obj.c;
            matrix[5][idx] = obj.v;

            // Additional Trading Strategy data
            // See Candle model here https://tradingstrategy.ai/api/explorer/
            matrix[6][idx] = obj.b;
            matrix[7][idx] = obj.s;
            matrix[8][idx] = obj.bv;
            matrix[9][idx] = obj.sv;
        });

        return matrix;
    }

    /**
     * Convert liquidity samples to internal uPlot format.
     *
     * XYLiquidity samples from from the server as descripted in OpenAPI
     * https://tradingstrategy.ai/api/explorer/
     *
     * The server returns one list of JavaScript objects (o, h, l, c, v).
     * uPlot wants x-array (time) and five separate y arrays (o, h, l, c, v).
     *
     */
    function massageLiquidity(candles: any[]): number[][] {
        const cols = candles.length;
        const rows = 9;

        // Try to be smart and hint typed arrays and length for JavaScript VM
        // So sad JavaScript can't do even this basic shit.
        // https://stackoverflow.com/a/68411296/315168
        let matrix = Array(rows).fill().map(entry => Array(cols))

        candles.forEach(function(obj: any, idx: number) {

            // Time series
            const unixTime = parseUTCTime(obj.ts);
            matrix[0][idx] = unixTime;

            // Liquidity data as in XYLiquiditySample description
            matrix[1][idx] = obj.o;
            matrix[2][idx] = obj.h;
            matrix[3][idx] = obj.l;
            matrix[4][idx] = obj.c;
            matrix[5][idx] = obj.a;
            matrix[6][idx] = obj.r;
            matrix[7][idx] = obj.av;
            matrix[8][idx] = obj.rv;
        });

        return matrix;
    }

    /**
     * Reload new candle data from the server and update the candle stick chart compontent.
     *
     * @param bucket
     */
    async function reloadCandlesOnBucketChange(bucket: string) {

        // Only start loading after we get a valid bucket on the client side
        if (!(browser && bucket)) {
            return;
        }

        // Switch to skeleton loader on the candle view
        candles = null;
        liquidity = null;

        // https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
        const params = {
            pair_id: summary.pair_id,
            time_bucket: bucket,
        }

        const encoded = new URLSearchParams(params);
        const candlesApiUrl = `${backendUrl}/candles?${encoded}`;
        const liquidityApiUrl = `${backendUrl}/xyliquidity?${encoded}`;

        const [candleResp, liquidityResp] = await Promise.all([fetch(candlesApiUrl), fetch(liquidityApiUrl)]);

        if(!candleResp.ok) {
            console.error(candleResp);
            return;
        }

        if(!liquidityResp.ok) {
            console.error(liquidityResp);
            return;
        }

        const rawCandles = await candleResp.json();
        const rawLiquiditySamples = await liquidityResp.json();

        console.log("Loaded", rawCandles.length, "candles and ", rawLiquiditySamples.length, "liquidity samples");

        if(rawCandles) {
            // We have some candles for this time period
            candles = massageCandles(rawCandles);
        } else {
            console.error("No candles");
            candles = [];
        }

        if(rawLiquiditySamples) {
            // We have some candles for this time period
            liquidity = massageLiquidity(rawLiquiditySamples);
        } else {
            console.error("No liquidity samples");
            liquidity = [];
        }

    }

    export let bucket = fromHashToTimeBucket(hash);
    // console.log("Got hash", hash, "bucket", bucket);
    // $: console.log(`The active bucket is ${bucket}`);

    // Leave room for Trade now?
    export let tradingLink = details.trade_link
    export let splashColClass = tradingLink ? "col-md-8" : "col-md-12";

    // Ridiculous token price warning.
    // It is common with scam tokens to price the token super low so that prices are not readable
    // when converted to USD.
    export let ridiculousPrice = summary.usd_price_latest < 0.000001;

    export let baseTokenName, quoteTokenName;

    // console.log("Trading link", tradingLink);

    // Price text
    $: priceChangeColorClass = summary.price_change_24h >= 0 ? "price-change-green" : "price-change-red";

    // TODO: Fix this in the data source
    $: {
        [baseTokenName, quoteTokenName] = summary.pair_name.split("-");
    }

    $: reloadCandlesOnBucketChange(bucket);

</script>

<svelte:head>
	<title>
        {summary.pair_symbol} token pair price on {details.exchange_name}
    </title>
	<meta name="description" content={`Price and liquidity for ${summary.pair_symbol} on ${details.exchange_name} on ${details.chain_name}`}>
</svelte:head>

<div class="container">

    <Breadcrumb breadcrumbs={breadcrumbs} />

    <div class="text-section">

        <div class="row">
            <div class="col-md-12">
                <h1>
                    {summary.pair_symbol} token pair on
                    <a href="/trading-view/{chain_slug}/{exchange_slug}">{details.exchange_name} </a>
                    on <a href="/trading-view/{chain_slug}">{details.chain_name}</a>
                </h1>
            </div>
        </div>

        <div class="row">

            <div class="col-lg-5">
                <PairInfoTable {summary} {details} {tokenTax} />
            </div>

            <div class="col-lg-7">

                <p>
                    The token pair

                    <a class="body-link" href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}">
                        {baseTokenName}
                    </a>

                    –

                    <a class="body-link" href="/trading-view/{summary.chain_slug}/tokens/{summary.quote_token_address}">
                        {quoteTokenName}
                    </a>

                    trades as the ticker

                    <strong>{summary.pair_symbol}</strong> on <a class=body-link href="/trading-view/{chain_slug}/{exchange_slug}">{details.exchange_name} exchange</a>
                    on <a class=body-link href="/trading-view/{chain_slug}">{details.chain_name} blockchain</a>.
                </p>

                <p>
                    The price of <a class="body-link" href="/trading-view/{summary.chain_slug}/tokens/{summary.base_token_address}">
                        {summary.base_token_symbol}
                    </a> in <strong>{summary.pair_symbol}</strong> pair is <strong class="{priceChangeColorClass}">{formatDollar(summary.usd_price_latest)}</strong> and is
                    <strong class="{priceChangeColorClass}">{formatPriceChange(summary.price_change_24h)} {summary.price_change_24h > 0 ? "up" : "down"}</strong> against US Dollar for the last 24h.
                </p>

                <p>
                    The pair has <strong>{formatDollar(summary.usd_volume_24h)}</strong> 24h trading volume with <strong>{formatDollar(summary.usd_liquidity_latest)}</strong> liquidity available at the moment.

                    The trading of {summary.pair_symbol} started at <strong><RelativeDate timestamp={details.first_trade_at} /></strong>.
                    The last trade was seen less than <strong><RelativeDate hours timestamp={details.last_trade_at} /></strong>.
                </p>

                {#if details.pair_contract_address }
                    <p>
                        The trading pair pool smart contract is at address <a href={details.pair_explorer_link} class="body-link">{details.pair_contract_address}</a>.
                    </p>
                {/if}



            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            {#if tokenTax.broken }
                <div class="alert alert-danger">
                    ⚠️ This token is unlikely to be tradeable.
                    <a rel="external" class="body-link" href="https://tradingstrategy.ai/docs/programming/token-tax.html">
                        Read more about tokens being broken, malicious or honeypots.
                    </a>
                </div>
            {/if}

            {#if ridiculousPrice}
                <div class="alert alert-danger">
                    ⚠️ This trading pair is using low digit price units that may prevent displaying the price data properly.
                </div>
            {/if}
        </div>
    </div>

    <div class="row">
        <div class="col-md-12">
            <div class="trade-actions">
                <a href={details.buy_link} class="btn btn-primary">Buy {summary.base_token_symbol_friendly}</a>
                <a href={details.sell_link} class="btn btn-primary">Sell {summary.base_token_symbol_friendly}</a>
                <a href={details.explorer_link} class="btn btn-primary">Blockchain explorer</a>
                <a href="/trading-view/backtesting" class="btn btn-primary">Download historical data</a>
            </div>
        </div>
    </div>

    <h2>{summary.pair_symbol} charts</h2>

    <TimeBucketSelector bind:activeBucket={bucket} />

    <h3>Price and volume chart</h3>

    <div class="chart-wrapper">
        <CandleStickChart bind:candles={candles} {uPlot} />
        <p class="chart-help-text">
            Trading activity expressed as <a rel="external" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">
                OHLCV candles.
            </a>
        </p>

    </div>

    <h3>Liquidity chart</h3>

    <div class="chart-wrapper">
        <LiquidityChart bind:liquiditySamples={liquidity} {uPlot} />
        <p class="chart-help-text">
            Available liquidity expressed as <a rel="external" href="https://tradingstrategy.ai/docs/glossary.html#term-XY-liquidity-model">
                the US Dollar value of one side of XY liquidity curve.
            </a>
        </p>
    </div>

    <h2>Time period summary</h2>

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
        margin-bottom: 20px;
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

    .trade-actions {

    }

    .chart-help-text {
        text-align: center;
        font-size: 80%;
        color: #525480;
    }

    .trade-actions .btn {
        margin: 20px 20px 20px 0;
    }

    /**
     * Prevent CLS issues on desktop
     *
     * https://web.dev/cls/
     */
    @media (min-width: 992px) {
        .chart-wrapper {
            /*
            min-height: 820px;
            contain: size paint;
             */
        }

        :global(.skeleton) {
            height: 800px;
        }
    }
</style>

<script context="module">
    /*
        Render the pair trading page

        - Load pair core data on the SSR.

        - Candle data loading is delayed to the client side (though in theory the first run could be done on the SSR)

        - Selected candle stick time bucket is carried over in URL fragment - this could be moved to SvelteKit routing query parameter
    */

    import { backendUrl } from '$lib/config';

    import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    /**
     * On the server-side, we load only pair details.
     *
     * All charting data fetches are done on the client side.
     */
    export async function load({ url, params, fetch }) {

        const exchange_slug = params.exchange;
        const chain_slug = params.chain;
        const pair_slug = params.pair;
        const token_slug = params.token;
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
            // Cache the pair data pages for 30 minutes at the Cloudflare edge,
            // so the pages are served really fast if they get popular,
            // and also for speed test
            maxage: 30*60, // 30 minutes,
            props: {
                exchange_slug,
                chain_slug,
                pair_slug,
                token_slug,
                summary,
                details,
                daily,
				breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
            }
        }
    }
</script>

<script lang="ts">

    import Time from "svelte-time";
    import {formatDollar, formatUnixTimestamp, parseUTCTime} from '$lib/helpers/formatters';
    import { formatPriceChange } from '$lib/helpers/formatters';
    import { fromHashToTimeBucket } from '$lib/chart/TimeBucketSelector.svelte';
    import { browser } from '$app/env';

    import TimeBucketSelector from '$lib/chart/TimeBucketSelector.svelte';
    import CandleStickChart from '$lib/chart/CandleStickChart.svelte';
    import TimeSpanPerformance from '$lib/chart/TimeSpanPerformance.svelte';
	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
    import PairInfoTable from "$lib/content/PairInfoTable.svelte";
    import LiquidityChart from "$lib/chart/LiquidityChart.svelte";
    import {onMount} from "svelte";

    export let exchange_slug;
    export let chain_slug;
    export let summary; // PairSummary OpenAPI
    export let details; // PairAdditionalDetails OpenAPI
    export let breadcrumbs;
    export let token_slug;

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

</script>

<svelte:head>
	<title>
      token pair price on ${token_slug}
    </title>
	<meta name="description" content={`Price and liquidity for ${summary.pair_symbol} on ${details.exchange_name} on ${details.chain_name}`}>
</svelte:head>

<div class="container">
    <Breadcrumb breadcrumbs={breadcrumbs} />

    <div class="text-section">

        <div class="row">
            <div class="col-md-12">
                <h1>
                    {token_slug} token pair on
                    <a href="/trading-view/{chain_slug}/{exchange_slug}">{details.exchange_name} </a>
                    on <a href="/trading-view/{chain_slug}">{details.chain_name}</a>
                </h1>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-5">
                <PairInfoTable {summary} {details} />
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

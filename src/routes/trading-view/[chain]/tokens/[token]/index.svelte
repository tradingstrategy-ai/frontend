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
        // const encoded = new URLSearchParams({exchange_slug, chain_slug, pair_slug});
        const apiUrl = `${backendUrl}/token/details?chain_slug=ethereum&address=0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48`;

        const resp = await fetch(apiUrl);

        console.log(resp)

        if(!resp.ok) {
            if(resp.status === 404) {
                console.error("Token missing", pair_slug)
                return {
                    status: 404,
                    error: `Token not found: ${pair_slug}`
                }
            } else {
                console.error("Failed to load token", apiUrl);
                return {
                    status: resp.status,
                    error: new Error(`Could not load data for trading pair: ${apiUrl}. See console for details.`)
                };
            }
        }

        const tokenDetails = await resp.json()

        const summary = tokenDetails;

        console.log("Summary", summary);

        const readableNames = {
            ...breadcrumbTranslations,
            [exchange_slug]: exchange_slug,
            [pair_slug]: token_slug
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
				breadcrumbs: buildBreadcrumbs(url.pathname, readableNames)
            }
        }
    }
</script>

<script lang="ts">

	import Breadcrumb from '$lib/breadcrumb/Breadcrumb.svelte';
    import TokenInfoTable from "$lib/content/TokeninfoTable.svelte";
    import StaleDataWarning from "$lib/chain/StaleDataWarning.svelte";
	import PairExplorer from "$lib/explorer/PairExplorer.svelte";

    export let exchange_slug;
    export let chain_slug;
    export let summary; // PairSummary OpenAPI
    export let token_slug;
    export let breadcrumbs;
    export let details; // PairAdditionalDetails OpenAPI


</script>

<svelte:head>
	<title>
      token pair price on ${token_slug}
    </title>
	<meta name="description" content={`Token slug`}>
</svelte:head>

<div class="container">
    <Breadcrumb breadcrumbs={breadcrumbs} />

    <div class="text-section">

        <div class="row">
            <div class="col-md-12">
                <h1>
                    Token {token_slug}
                    <a href="/trading-view/{chain_slug}/{exchange_slug}"></a>
                    on <a href="/trading-view/{chain_slug}"></a>
                </h1>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-5">
                <TokenInfoTable {summary} />
            </div>
        </div>
    </div>

    <div class="trading-pairs">
        <h1>Trading pairs</h1>

        <p>
            Browse trading pairs across all <a href="/trading-view/exchanges">decentralised exchanges</a> below.
        </p>

        <StaleDataWarning allChains={true} />

        <PairExplorer
            enabledColumns={["pair_name", "exchange_name", "usd_price_latest", "price_change_24h", "usd_volume_30d", "usd_liquidity_latest", "liquidity_change_24h",]}
            orderColumnIndex={4}
            pageLength={50}
            />
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

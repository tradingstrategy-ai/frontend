<script context="module">
    /*
        Render the token page

        - Load token core data on the SSR.
    */

    import { backendUrl } from '$lib/config';

    import breadcrumbTranslations, {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    /**
     * On the server-side, we load only token details.
     */
    export async function load({ url, params, fetch }) {


        const exchange_slug = params.exchange;
        const chain_slug = params.chain;
        const pair_slug = params.pair;
        const token_slug = params.token;
        const token_address = token_slug;
        const address = token_slug;
        const encoded = new URLSearchParams({chain_slug, address});

        const apiUrl = `${backendUrl}/token/details?${encoded}`;

        const resp = await fetch(apiUrl);

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

        const readableNames = {
            ...breadcrumbTranslations,
            [exchange_slug]: exchange_slug,
            [pair_slug]: token_slug,
            [token_address]: tokenDetails.name
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
                token_address,
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

    export let summary;
    export let chain_slug;
    export let token_slug;
    export let breadcrumbs;
    export let token_address;

</script>

<svelte:head>
	<title>
      token {summary.name}
    </title>
	<meta name="description" content={`Token slug`}>
</svelte:head>

<div class="container">
    <Breadcrumb breadcrumbs={breadcrumbs} />

    <div class="text-section">

        <div class="row">
            <div class="col-md-12">
                <h1>
                    {summary.name} ({summary.symbol})
                </h1>
            </div>
        </div>

        <div class="row">
            <div class="col-lg-5">
                <TokenInfoTable {summary} />
            </div>
        </div>
    </div>

    <div class="pair-explorer-wrapper">
        <h1>Trading pairs</h1>

        <p>
            Browse <strong>{summary.symbol}</strong> trading pairs.
        </p>

        <StaleDataWarning allChains={true} />

        <PairExplorer
            enabledColumns={["pair_name", "exchange_name", "usd_price_latest", "price_change_24h", "usd_volume_30d", "usd_liquidity_latest", "liquidity_change_24h",]}
            orderColumnIndex={4}
            pageLength={50}
            tokenSymbol={summary.symbol}
            tokenAddress={token_address}
        />
    </div>
</div>

<style>
    h1 {
        font-size: 2rem;
        margin-bottom: 20px;
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

    .chart-help-text {
        text-align: center;
        font-size: 80%;
        color: #525480;
    }

    .trade-actions .btn {
        margin: 20px 20px 20px 0;
    }

    .pair-explorer-wrapper {
        margin-bottom: 60px;
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

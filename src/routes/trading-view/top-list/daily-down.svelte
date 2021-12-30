<script context="module">
    /**
     * Daily losers page
     */
    import { loadMomentumData } from "$lib/content/momentum.ts";
    import {buildBreadcrumbs} from "$lib/breadcrumb/builder";

    export async function load({ url, fetch }) {
        const breadcrumbs = {
            "trading-view": "Trading data",
            "top-list": "Top lists",
			"daily-down": "Daily losers",
        };
        return {
            props: {
                momentumData: await loadMomentumData(fetch),
                breadcrumbs: buildBreadcrumbs(url.pathname, breadcrumbs),
            }
        };
    }
</script>

<script>

    import StaleDataWarning from "$lib/chain/StaleDataWarning.svelte";
    import Breadcrumb from "$lib/breadcrumb/Breadcrumb.svelte";
    import MomentumTable from "$lib/content/MomentumTable.svelte";

    export let momentumData;
    export let breadcrumbs;

    export let pairs = momentumData && momentumData.top_down_24h_min_liq_1m;
</script>

<svelte:head>
    <title>
        DEX tokens with the highest daily losses
    </title>
    <meta
        name="description"
        content="Trading pairs with most volatile losses for the last 24h"
    />
</svelte:head>

<div class="container">

    <Breadcrumb breadcrumbs={breadcrumbs} />

    <h1>Trading pairs with the most loss for the last 24h</h1>

    <p class="lead">
        <a class="body-link" href="/trading-view/trading-pairs">Trading pairs</a> with the highest drawdown on <a class="body-link" href="/trading-view/exchanges">decentralised exchanges</a> today.
        Showing only the pairs with minimum $1M liquidity. All trading pairs are benchmarked against the US Dollar.
    </p>

    <div class="trading-pairs">
        <StaleDataWarning allChains={true}/>

        {#if pairs}
            <MomentumTable {pairs} kind="price" />
        {:else}
            <div class="alert alert-danger">
                Daily volatility data is not available at the moment.
            </div>
        {/if}
    </div>
</div>

<style>
    .lead {
        margin: 2rem 0;
    }
</style>
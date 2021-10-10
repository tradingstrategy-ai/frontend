<script context="module">
    import { backendUrl } from '$lib/config';
</script>

<script lang="ts">

    import SkeletonLine from '$lib/SkeletonLine.svelte';
    import IntersectionObserver from "svelte-intersection-observer";
    import {formatDollar, formatAmount, formatPriceChange} from "$lib/helpers/formatters";
    import '$lib/styles/price.css';

    // TimeSpanTradeData, see https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
    // Set null to have a skeleton loader
    export let timeSpanTradeData = null
    export let loadingStarted = false;
    export let period: string = null;
    export let title;
    export let pairId: string = null;

    let element;
    let intersecting = false;

    async function loadData() {
        // https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
        const params = {
            pair_id: pairId,
            period: period,
        }

        const encoded = new URLSearchParams(params);
        const apiUrl = `${backendUrl}/pair-trade-data?${encoded}`;

        const resp = await fetch(apiUrl);
        if(!resp.ok) {
            console.error(resp);
            return;
        }

        const data = await resp.json();
        timeSpanTradeData = data;
    }

    async function triggerLoadWhenVisible(visible) {
        // console.log("Triggered", visible);
        if(visible) {
            // console.log("Visible");
            if(!timeSpanTradeData && !loadingStarted) {
                loadingStarted = true;
                await loadData();
            }
        }
    }

    function determinePriceChangeClass(timeSpanTradeData) {
        if(!timeSpanTradeData) {
            return "price-change-black"; // Data not loaded
        }

        if(timeSpanTradeData.price_open == timeSpanTradeData.price_close) {
            return "price-change-black";
        } else if(timeSpanTradeData.price_close > timeSpanTradeData.price_open) {
            return "price-change-green";
        } else {
            return "price-change-red";
        }
    }

    $: triggerLoadWhenVisible(intersecting);

    // close > open determines if the period was succesful
    $: priceChangeColorClass = determinePriceChangeClass(timeSpanTradeData)

</script>

<div class="time-span-stats">
    <IntersectionObserver {element} bind:intersecting once>
        <table bind:this={element}>
            <tr>
                <th class={"title " + priceChangeColorClass} colspan="2">
                    {title}
                </th>
            </tr>

            <tr class="data-row">
                <th>Change</th>
                <td>
                    <span class={priceChangeColorClass}>
                        {#if timeSpanTradeData}
                            {formatPriceChange(timeSpanTradeData.price_close / timeSpanTradeData.price_open - 1)}
                        {:else}
                            <SkeletonLine />
                        {/if}
                    </span>
                </td>
            </tr>


            <tr class="data-row">
                <th>Open price</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatDollar(timeSpanTradeData.price_open)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

            <tr class="data-row">
                <th>Highest price</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatDollar(timeSpanTradeData.price_high)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

            <tr class="data-row">
                <th>Lowest price</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatDollar(timeSpanTradeData.price_low)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

            <tr class="data-row">
                <th>Close price</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatDollar(timeSpanTradeData.price_close)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

            <tr class="data-row">
                <th>Highest liquidity</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatDollar(timeSpanTradeData.liquidity_high)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

            <tr class="data-row">
                <th>Lowest liquidity</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatDollar(timeSpanTradeData.liquidity_low)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>


            <tr class="data-row">
                <th>Buying trades</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatAmount(timeSpanTradeData.buys)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

            <tr class="data-row">
                <th>Selling trades</th>
                <td>
                    {#if timeSpanTradeData}
                        {formatAmount(timeSpanTradeData.sells)}
                    {:else}
                        <SkeletonLine />
                    {/if}
                </td>
            </tr>

        </table>
    </IntersectionObserver>
</div>


    <style>

        th {
            text-align: right;
            padding-right: 5px;
        }

    .data-row {
        font-size: 80%;
    }

    td {
        text-align: left;
    }

    .title {
        text-align: center;
    }


</style>
<script>

    import SkeletonLine from '$lib/SkeletonLine.svelte';
    import {formatDollar, formatAmount} from "$lib/helpers/formatters";

    // TimeSpanTradeData, see https://tradingstrategy.ai/api/explorer/#/Pair/web_candles
    // Set null to have a skeleton loader
    export let timeSpanTradeData = null
    export let title;
</script>


<table>

    <tr>
        <th class="title" colspan="2">{title}</th>
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
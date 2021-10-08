<script lang="ts">

    /*

        Render candlestick chart using uPlot

        https://github.com/leeoniya/uPlot

        Because uPlot is client-only library using <canvas> we need to dynamically import it on the client-side.

     */

    import Skeleton from '$lib/Skeleton.svelte';
    import { browser } from '$app/env';
    import { onMount } from 'svelte';
    import "uplot/dist/uPlot.min.css";
    import {clearChart, drawCandleStickChart} from "./uPlotCandlestickCore.js";

    // See CandleList https://tradingstrategy.ai/api/explorer/
    export let candles = null;
    export let title = "";

    // Dynamically imported uplot
    let uPlot;

    function redrawCandles(candles: any[], uPlot) {

        if(!uPlot) {
            // console.log("uplot not loaded, won't draw candles");
            return;
        }

        const elem = document.getElementById("uplot-wrapper");

        if(!candles) {
            // console.log("Skipping candle draw - no candles loaded");
            clearChart(elem);
            return;
        }

        console.log("Redrawing candles", candles);

        drawCandleStickChart(uPlot, null, elem, candles);
    }


    // https://stackoverflow.com/questions/57030895/whats-the-best-way-to-run-some-code-only-client-side
    onMount(async () => {
        if (browser) {
            // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#dynamic_imports
            const uplotModule = await import('uplot');
            console.log("uplot dynamically imported", uplotModule, uplotModule.default);
            // This will trigger candle redraw if candles data was raced faster than uplot
            uPlot = uplotModule.default;

        }
    });

    $: redrawCandles(candles, uPlot);

</script>


<div class="candle-stick-chart">
    <div id="uplot-wrapper">
        {#if candles}
            {#if candles.length === 0 }
                <p>No data available for the selected period</p>
            {:else}
                <!-- We should place uplot-wapper here but there is a race condition with uPlot renderer -->
            {/if}
        {:else}
            <Skeleton />
        {/if}
    </div>
</div>

<style>
    #uplot-wrapper {
        width: 100%;
        min-height: 600px;
    }

</style>
<script lang="ts">

    /*

        Render candlestick chart using uPlot

        https://github.com/leeoniya/uPlot

        Because uPlot is client-only library using <canvas> we need to dynamically import it on the client-side.

     */

    import Skeleton from '$lib/Skeleton.svelte';
    import "uplot/dist/uPlot.min.css";
    import { clearChart, drawCandleStickChart } from "./uPlotCandlestickCore.js";

    // See massageCandles()
    export let candles = null;

    // Dynamically imported uplot
    export let uPlot = null;

    let classes;

    function redrawCandles(candles: any[], uPlot) {

        if(!uPlot) {
            // console.log("uplot not loaded, won't draw candles");
            return;
        }

        const elem = document.getElementById("candlestick-uplot-wrapper");

        if(!candles) {
            //console.log("Skipping candle draw - no candles loaded");
            console.log("Clearing", elem);
            clearChart(elem);
            return;
        }

        console.log("Redrawing candles", candles);

        if(candles[0].length > 0) {
            classes = "uplot-wrapper";
            drawCandleStickChart(uPlot, null, elem, candles);
        } else {
            classes = "uplot-wrapper uplot-wrapper-empty";
        }
    }

    $: redrawCandles(candles, uPlot);

</script>


<div class="candle-stick-chart">

    {#if candles}
        {#if candles[0].length !== 0 }
            <div class="hacky-axis-labels">
                <span class="label-hacky label-volume">Volume</span>
                <span class="label-hacky label-price">Price</span>
            </div>
        {/if}
    {/if}

    <div id="candlestick-uplot-wrapper" class={classes}>
        {#if candles }
            {#if candles[0].length === 0 }
                <div class="alert alert-danger shadow-inset fade show" role="alert"><span
                        class="alert-inner--icon"><span class="fas fa-exclamation-circle"></span></span> <span
                        class="alert-inner--text">


                    <p>No data available for the selected period</p>

                </div>

            {:else}
                <!-- We should place uplot-wapper here but there is a race condition with uPlot renderer -->
            {/if}
        {:else}
            <Skeleton />
        {/if}
    </div>
</div>

<style>
    /*
    .uplot-wrapper {
        width: 100%;
        min-height: 600px;
    }

    .uplot-wrapper-empty {
        min-height: auto;
    }*/

    .hacky-axis-labels {
        display: flex;
        justify-content: space-between;
    }

    .label-hacky {
        text-transform: uppercase;
        font-weight: bold;
        font-size: 10px;
        font-family: "Open Sans", sans-serif;
    }

</style>
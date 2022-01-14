<script lang="ts">

    /*

        Render liquidity map using uPlot

        https://github.com/leeoniya/uPlot

        Because uPlot is client-only library using <canvas> we need to dynamically import it on the client-side.

     */

    import Skeleton from '$lib/Skeleton.svelte';
    import "uplot/dist/uPlot.min.css";
    import {drawLiquidityStickChart} from "$lib/chart/uPlotLiquidityCore";
    import {clearChart} from "$lib/chart/uPlotCandlestickCore";

    // See massageLiquidity()
    export let liquiditySamples = null;

    // Dynamically imported uplot
    export let uPlot = null;

    let classes;

    function redrawCandles(candles: any[], uPlot) {

        if(!uPlot) {
            // console.log("uplot not loaded, won't draw candles");
            return;
        }

        const elem = document.getElementById("liquidity-uplot-wrapper");

        if(!liquiditySamples) {
            console.log("Clearing element", elem);
            clearChart(elem);
            return;
        }

        console.log("Redrawing liquidity", candles);

        if(liquiditySamples[0].length > 0) {
            classes = "uplot-wrapper";
            clearChart(elem);
            drawLiquidityStickChart(uPlot, null, elem, liquiditySamples);
        } else {
            classes = "uplot-wrapper uplot-wrapper-empty";
        }
    }

    $: redrawCandles(liquiditySamples, uPlot);

</script>


<div class="liquidity-chart">

    {#if liquiditySamples}
        {#if liquiditySamples[0].length !== 0 }
            <div class="hacky-axis-labels">
                <span class="label-hacky">In/out flow</span>
                <span class="label-hacky">Available liquidity</span>
            </div>
        {/if}
    {/if}

    <div id="liquidity-uplot-wrapper" class={classes}>
        {#if liquiditySamples }
            {#if liquiditySamples[0].length === 0 }
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
<!--
	Page to display the strategy backtest results.
-->
<script lang="ts">

    import {Button, SummaryBox} from "$lib/components";
    import { onMount } from 'svelte';
    import type {StrategyRuntimeState} from "trade-executor-frontend/strategy/runtimeState";

    export let data: StrategyRuntimeState;


    export let iframeSrc;
    export let wantedHeight=100;

    console.log(data);

    $: strategy = data?.strategy;
    $: baseUrl = strategy?.url;
    $: iframeUrl = baseUrl ? `${baseUrl}/file?type=html` : null;
    $: notebookUrl = baseUrl ? `${baseUrl}/file?type=notebook` : null;
    $: notebookName = `${strategy?.id}.ipynb`;

    function onLoad(evt) {
        console.log("loaded", evt);
        const desiredHeight = this.contentWindow.document.documentElement.scrollHeight;
        //el.style.height =  + 'px';]
        console.log("Height", desiredHeight);
        wantedHeight = desiredHeight;
    }

	onMount(() => {
		iframeSrc = iframeUrl;
	});

</script>

<section class="backtest">
    <SummaryBox title="Backtest data" ctaPosition="top">
        <div class="content">
            View the backtest results below or download the notebook repeat the backtests yourself.
        </div>
        <div class="actions">
            <!-- TODO: <a download> does not seem to work here, but always causes the page load instead of downlaod -->
            <Button label="Download notebook" download={notebookName} disabled={notebookUrl == null} href={notebookUrl} />
            <!-- TODO: The webhook endpoint missing -->
            <Button label="Download raw backtest data" disabled />
        </div>
    </SummaryBox>

    {#if iframeSrc}
        <iframe on:load={onLoad} src={iframeSrc} bind:clientHeight={wantedHeight}>

        </iframe>
    {/if}

</section>

<style>
    iframe {
        width: 100%;
        border: 0;
    }
</style>

<!--
Backtest results page for YAML-configured strategies.

Renders the backtest HTML report in an iframe served from
the local report endpoint. Uses postMessage to auto-resize
the iframe height to match its content.
-->
<script lang="ts">
	import { Alert, Spinner, SummaryBox } from '$lib/components';

	export let data;
	const { strategy } = data;

	const iframeUrl = `/strategies/${strategy.slug}/backtest/report`;

	let iframeLoaded = false;
	let iframeHeight = 0;

	function handleMessage({ data }: MessageEvent) {
		if (data.iframeContentHeight) {
			iframeLoaded = true;
			iframeHeight = data.iframeContentHeight;
		}
	}
</script>

<svelte:window on:message={handleMessage} />

<svelte:head>
	<title>Backtest results | {strategy.name} | Trading Strategy</title>
	<meta name="description" content="Detailed backtest results for {strategy.name} strategy" />
</svelte:head>

<section class="backtest">
	<SummaryBox title="Backtest results">
		<div class="content">
			You can find the backtest results for this strategy below.
			<a class="body-link" href="/glossary/backtest">Learn more about backtesting</a>.
		</div>
	</SummaryBox>

	{#if !iframeLoaded}
		<div class="spinner-wrapper">
			<Spinner size="60" />
		</div>
	{/if}

	<iframe src={iframeUrl} title="Backtest report" style:height="{iframeHeight}px"></iframe>
</section>

<style>
	.backtest {
		display: grid;
		gap: 1.5rem;
		align-items: start;

		iframe {
			width: 100%;
			border: 0;
		}

		.spinner-wrapper {
			text-align: center;
		}
	}
</style>

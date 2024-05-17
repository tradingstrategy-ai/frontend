<!--
Page to display the strategy backtest results.

- We are working hard to make iframe resize to work cross-domain,
  because trade-executor HTML report is being served from a different domain
  and the web browser policy prevents us to access iframe content to read its internal height

- We work around this using a postMessage hack
  https://stackoverflow.com/a/44547866/315168

-->
<script lang="ts">
	import { Alert, Spinner, SummaryBox } from '$lib/components';

	export let data;
	const { strategy } = data;

	const iframeUrl = `${strategy.url}/file?type=html`;

	let iframeLoaded = false;
	let iframeHeight = 0;

	// Backtested result HTML includes JS snippet to post its content height to parent frame
	// See: https://github.com/tradingstrategy-ai/trade-executor/blob/4a336031ded403d4fff9819d339a680d6f65b210/tradeexecutor/backtest/report.py#L51
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
	{#if strategy.backtest_available}
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

		<iframe src={iframeUrl} title="Backtest report" style:height="{iframeHeight}px" />
	{:else}
		<Alert>Backtest report not available for this strategy.</Alert>
	{/if}
</section>

<style>
	.backtest {
		display: grid;
		gap: 1.5rem;

		iframe {
			width: 100%;
			border: 0;
		}

		.spinner-wrapper {
			text-align: center;
		}
	}
</style>

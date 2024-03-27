<!--
Page to display the strategy backtest results.

- We are working hard to make iframe resize to work cross-domain,
  because trade-executor HTML report is being served from a different domain
  and the web browser policy prevents us to access iframe content to read its internal height

- We work around this using a postMessage hack
  https://stackoverflow.com/a/44547866/315168

-->
<script lang="ts">
	import { Alert, Button, SummaryBox } from '$lib/components';
	import Spinner from 'svelte-spinner';

	export let data;
	const { strategy } = data;

	const iframeUrl = `${strategy.url}/file?type=html`;
	const notebookUrl = `/strategies/${strategy.id}.ipynb`;

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

<section class="backtest">
	{#if strategy.backtest_available}
		<SummaryBox title="Backtest results" ctaPosition="top">
			<div class="content">
				You can find the backtest results for this strategy below.
				<a class="body-link" href="/glossary/backtest">Learn more about backtesting</a>.
			</div>
		</SummaryBox>

		{#if !iframeLoaded}
			<div class="spinner-wrapper">
				<Spinner size="60" color="var(--c-text-extra-light)" />
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

		:global(.summary-box header .cta) {
			gap: 0.75rem;

			@media (--viewport-sm-down) {
				grid-area: 2 / 1 / span 2;
				display: grid;
				grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr));
				margin-block: 0.75rem;
			}
		}

		iframe {
			width: 100%;
			border: 0;
		}

		.spinner-wrapper {
			text-align: center;
		}
	}
</style>

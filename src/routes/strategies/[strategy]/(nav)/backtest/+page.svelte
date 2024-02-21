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

	let iframeElem: HTMLIFrameElement;
	let iframeLoaded = false;

	$: strategy = data?.strategy;
	$: backtested = data?.summary?.backtest_available;
	$: baseUrl = strategy?.url;
	$: iframeUrl = baseUrl && `${baseUrl}/file?type=html`;
	$: notebookUrl = baseUrl && `${baseUrl}/file?type=notebook`;
	$: notebookName = `${strategy?.id}.ipynb`;

	// iframe (or any plugin crap) wants to communicate with us
	// Listen for the height messages from the iframe
	// Backtested result HTML comes with a special JS snippet to post its content height to parent frame
	// See code here https://github.com/tradingstrategy-ai/trade-executor/blob/4a336031ded403d4fff9819d339a680d6f65b210/tradeexecutor/backtest/report.py#L51
	function handleMessage({ data }: MessageEvent) {
		if (data.iframeContentHeight) {
			iframeLoaded = true;
			iframeElem.style.height = `${data.iframeContentHeight}px`;
		}
	}
</script>

<svelte:window on:message={handleMessage} />

<section class="backtest">
	{#if backtested}
		<SummaryBox title="Backtest data" ctaPosition="top">
			<div class="content">
				<ul>
					<li>View the backtest result report below or download the notebook run the backtests yourself.</li>
					<li>
						<a class="body-link" href="/glossary/backtest">Learn more about backtests</a>.
					</li>
				</ul>
			</div>

			<div class="actions" slot="cta">
				<!-- TODO: <a download> does not seem to work here, but always causes the page load instead of downlaod -->
				<Button
					size="sm"
					label="Download notebook"
					download={notebookName}
					disabled={notebookUrl == null}
					href={notebookUrl}
				/>
				<!-- TODO: The webhook endpoint missing -->
				<Button size="sm" label="Download raw backtest data" disabled />
			</div>
		</SummaryBox>

		{#if !iframeLoaded}
			<div class="spinner-wrapper">
				<Spinner size="2rem" color="var(--c-text-light)" />
			</div>
		{/if}

		<iframe bind:this={iframeElem} src={iframeUrl} title="Backtest report" />
	{:else}
		<Alert>Backtest report not available for this strategy.</Alert>
	{/if}
</section>

<style>
	iframe {
		margin: var(--space-lg) 0;
		width: 100%;
		border: 0;
		height: 0;
	}

	.spinner-wrapper {
		margin: var(--space-lg) 0;
		text-align: center;
	}

	.actions {
		display: flex;
		gap: var(--space-md);

		@media (--viewport-sm-down) {
			flex-direction: column;
			gap: var(--space-sm);
			margin-bottom: var(--space-md);
		}
	}
</style>

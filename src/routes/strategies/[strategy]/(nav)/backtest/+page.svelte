<!--
Page to display the strategy backtest results.

- We are working hard to make iframe resize to work cross-domain,
  because trade-executor HTML report is being served from a different domain
  and the web browser policy prevents us to access iframe content to read its internal height

- We work around this using a postMessage hack
  https://stackoverflow.com/a/44547866/315168

-->
<script lang="ts">
	import { AlertItem, Button, SummaryBox } from '$lib/components';
	import { onMount } from 'svelte';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import AlertList from '$lib/components/AlertList.svelte';
	import Spinner from 'svelte-spinner';

	export let data: StrategyRuntimeState;

	export let iframeElem;
	export let iframeSrc;
	export let wantedHeight = 0;

	$: strategy = data?.strategy;
	$: backtested = data?.summary?.backtest_available;
	$: baseUrl = strategy?.url;
	$: iframeUrl = baseUrl ? `${baseUrl}/file?type=html` : null;
	$: notebookUrl = baseUrl ? `${baseUrl}/file?type=notebook` : null;
	$: notebookName = `${strategy?.id}.ipynb`;

	// iframe (or any plugin crap) wants to communicate with us
	// Listen for the height messages from the iframe
	// Backtested result HTML comes with a special JS snippet to post its content height to parent frame
	// See code here https://github.com/tradingstrategy-ai/trade-executor/blob/4a336031ded403d4fff9819d339a680d6f65b210/tradeexecutor/backtest/report.py#L51
	function onMessage(evt) {
		//console.log("Message", evt);
		if (evt.data.iframeContentHeight) {
			wantedHeight = evt.data.iframeContentHeight;
			console.log('Resized to', wantedHeight);
			iframeElem.style = `height: ${wantedHeight}px`;
		}
	}

	// Trigger iframe load lazily so that other
	// message handlers are ready
	onMount(() => {
		window.addEventListener('message', onMessage);

		iframeSrc = iframeUrl;

		//  https://stackoverflow.com/a/73155581/315168
		return () => {
			window.removeEventListener('message', onMessage);
		};
	});
</script>

<section class="backtest">
	{#if backtested}
		<SummaryBox title="Backtest data" ctaPosition="top">
			<div class="content">
				<ul>
					<li>View the backtest result report below or download the notebook run the backtests yourself.</li>
					<li>
						<a class="help-link" href="/glossary/backtest">Learn more about backtests</a>.
					</li>
				</ul>
			</div>

			<div class="actions">
				<!-- TODO: <a download> does not seem to work here, but always causes the page load instead of downlaod -->
				<Button label="Download notebook" download={notebookName} disabled={notebookUrl == null} href={notebookUrl} />
				<!-- TODO: The webhook endpoint missing -->
				<Button label="Download raw backtest data" disabled />
			</div>
		</SummaryBox>

		{#if !wantedHeight}
			<div class="spinner-wrapper">
				<Spinner size="2rem" color="hsla(var(--hsl-text-light))" />
			</div>
		{/if}

		{#if iframeSrc}
			<iframe bind:this={iframeElem} src={iframeSrc} />
		{:else}{/if}
	{:else}
		<AlertList>
			<AlertItem>Backtest report not available for this strategy.</AlertItem>
		</AlertList>
	{/if}
</section>

<style>
	iframe {
		margin: var(--space-lg) 0;
		width: 100%;
		border: 0;
		height: 0;
	}

	.help-link {
		text-decoration: underline;
	}

	.spinner-wrapper {
		margin: var(--space-lg) 0;
		text-align: center;
	}
</style>

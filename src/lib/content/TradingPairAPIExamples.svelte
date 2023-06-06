<!--
@compontent
Trading pair API examples. Display inline curl examples for retreiving trading pair data.
-->
<script lang="ts">
	export let summary: any;

	$: jsonlUrl = `https://tradingstrategy.ai/api/candles-jsonl?exchange_slug=${summary.exchange_slug}&chain_slug=${summary.chain_slug}&pair_slug=${summary.pair_slug}`;
	$: pairInfoUrl = `https://tradingstrategy.ai/api/pair-details?exchange_slug=${summary.exchange_slug}&chain_slug=${summary.chain_slug}&pair_slug=${summary.pair_slug}`;
	$: candlesUrl = `https://tradingstrategy.ai/api/candles?pair_id=${summary.pair_id}&exchange_type=${summary.exchange_type}&time_bucket=1d`;
</script>

<div class="api-info">
	<h2>Trading pair info</h2>

	<h3>JSONL</h3>

	<p>Get trading pair overview as JSONL over HTTP GET. This is preferred method for getting large amounts of OHLCV data. <a class="body-link" href="https://tradingstrategy.ai/api/explorer/#/Trading%20pair/web_candles_jsonl">Click here</a> for more information on how to stream JSONL data. </p>

	<pre>curl "{jsonlUrl}"</pre>

	<h3>JSON</h3>

	<p>Get trading pair overview as JSON over HTTP GET.</p>

	<pre>curl "{pairInfoUrl}"</pre>

	<h2>Daily OHLCV data</h2>

	<p>
		Download daily <a class="body-link" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">OHLCV</a> candles
		as JSON over HTTP GET.
	</p>

	<pre>curl "{candlesUrl}"</pre>

	<h2>Backtesting datasets</h2>

	<p>
		Backtesting datasets are available as a separate download. The datasets include <strong
			>{summary.pair_symbol}</strong
		>
		data. View <a class="body-link" href="/trading-view/backtesting">backtesting datasets</a>.
	</p>
</div>

<style>
	.api-info h2 {
		margin-bottom: var(--space-md);
		font: var(--f-h2-medium);
	}

	.api-info h3 {
		margin-bottom: var(--space-md);
		font: var(--f-h3-medium);
	}

	.api-info p {
		margin-bottom: var(--space-md);
	}

	.api-info pre {
		background: var(--c-background-7-v1);
		border: 1px solid var(--c-border-1-v1);
		border-radius: var(--radius-xxs);
		color: var(--c-parchment);
		padding: var(--space-md);
		margin-bottom: var(--space-md);
	}
</style>

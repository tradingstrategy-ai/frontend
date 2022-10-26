<!--
@compontent
Trading pair API examples. Display inline curl examples for retreiving trading pair data.
-->
<script lang="ts">
	export let summary: any;

	$: pairInfoUrl = `https://tradingstrategy.ai/api/pair-details?exchange_slug=${summary.exchange_slug}&chain_slug=${summary.chain_slug}&pair_slug=${summary.pair_slug}`;
	$: candlesUrl = `https://tradingstrategy.ai/api/candles?pair_id=${summary.pair_id}&exchange_type=${summary.exchange_type}&time_bucket=1d`;
</script>

<div class="api-info">
	<h2>Trading pair info</h2>

	<p>Get trading pair overview as JSON over HTTP GET.</p>

	<pre>curl "{pairInfoUrl}"</pre>

	<p>
		<a class="body-link" href={pairInfoUrl}> Click here to test. </a>
	</p>

	<h2>Daily OHLCV data</h2>

	<p>
		Download daily <a class="body-link" href="https://tradingstrategy.ai/docs/glossary.html#term-OHLCV">OHLCV</a> candles
		as JSON over HTTP GET.
	</p>

	<pre>curl "{candlesUrl}"</pre>

	<p>
		<a class="body-link" href={candlesUrl}> Click here to test. </a>
	</p>

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
		margin-bottom: 1rem;
	}

	.api-info p {
		margin-bottom: 1rem;
	}

	.api-info pre {
		background: var(--c-background-7);
		border: 1px solid var(--c-border-1);
		border-radius: 0.375rem;
		color: var(--c-parchment);
		padding: 1rem;
		margin-bottom: 1rem;
	}
</style>

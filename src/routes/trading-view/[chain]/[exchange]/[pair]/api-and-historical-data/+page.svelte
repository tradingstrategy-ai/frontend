<!--
Real time examples for the API
-->
<script lang="ts">
	import type { PageData } from './$types';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TradingPairAPIExamples from '$lib/content/TradingPairAPIExamples.svelte';

	export let data: PageData;

	$: summary = data.summary;
	$: details = data.additional_details;

	$: breadcrumbs = {
		[summary.exchange_slug]: summary.exchange_name,
		[summary.pair_slug]: summary.pair_name,
		'api-and-historical-data': 'API and historical data'
	};
</script>

<svelte:head>
	<title>
		{summary.pair_symbol} on {summary.exchange_name} API and data
	</title>

	<meta
		name="description"
		content={`Trading data for ${summary.pair_symbol} on ${summary.exchange_name} exchange on ${summary.chain_name} blockchain`}
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<div class="container">
	<h1>{summary.pair_symbol} API and historical data</h1>

	<p>
		Here are some API quickstart examples for <strong>{summary.pair_symbol}</strong> on
		<strong>{summary.exchange_name}</strong> on {summary.chain_name} blockchain.
	</p>

	<p>
		Examples here do not cover the full API. Read the full
		<a class="body-link" href="https://tradingstrategy.ai/api/explorer/"> real-time API </a>

		or

		<a class="body-link" href="https://tradingstrategy.ai/docs/programming/index.html">
			algorithmic trading programming
		</a>

		documentation.
	</p>

	<TradingPairAPIExamples {summary} />
</div>

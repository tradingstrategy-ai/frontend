<!--

Real time examples for the API

-->
<script context="module">
	import getApiError from '$lib/chain/getApiError';

	/**
	 * On the server-side, we load only pair details.
	 *
	 * All charting data fetches are done on the client side.
	 */
	export async function load({ url, params, fetch, session }) {
		const { backendUrl } = session.config;
		const exchange_slug = params.exchange;
		const chain_slug = params.chain;
		const pair_slug = params.pair;
		const encoded = new URLSearchParams({ exchange_slug, chain_slug, pair_slug });
		const apiUrl = `${backendUrl}/pair-details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'Trading pair', [chain_slug, exchange_slug, pair_slug]);
		}

		const pairDetails = await resp.json();

		const summary = pairDetails.summary;
		const details = pairDetails.additional_details;

		console.log('Summary', summary);
		console.log('Details', details);

		const breadcrumbs = {
			[exchange_slug]: details.exchange_name,
			[pair_slug]: summary.pair_name,
			'api-and-historical-data': 'API and historical data'
		};

		return {
			// Cache the pair data pages for 30 minutes at the Cloudflare edge,
			// so the pages are served really fast if they get popular,
			// and also for speed test
			cache: {
				maxage: 30 * 60, // 30 minutes
				private: false
			},
			props: { summary, details, breadcrumbs }
		};
	}
</script>

<script>
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import TradingPairAPIExamples from '$lib/content/TradingPairAPIExamples.svelte';

	export let details;
	export let summary;
	export let breadcrumbs;
</script>

<svelte:head>
	<title>
		{details.pair_symbol} API and historical data
	</title>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<div class="container">
	<h1>{summary.pair_symbol} API and historical data</h1>

	<p>
		Here are some API quickstart examples for <strong>{summary.pair_symbol}</strong> on
		<strong>{summary.exchange_name}</strong>.
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

	<TradingPairAPIExamples {summary} {details} />
</div>

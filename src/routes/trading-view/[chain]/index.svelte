<script context="module">
	import getApiError from '$lib/chain/getApiError';

	/**
	 * Display chain information and indexing status
	 */
	export async function load({ params, fetch, session }) {
		const { backendUrl } = session.config;
		const chain_slug = params.chain;

		// Load and render exchange details on the server side
		// https://tradingstrategy.ai/api/explorer/#/default/web_chain_details
		const encoded = new URLSearchParams({ chain_slug });
		const apiUrl = `${backendUrl}/chain-details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'Chain', [chain_slug]);
		}

		const details = await resp.json();
		return { props: { details } };
	}
</script>

<script>
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { formatAmount, formatUrlAsDomain } from '$lib/helpers/formatters';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import ExchangeExplorer from '$lib/explorer/ExchangeExplorer.svelte';

	export let details;
</script>

<svelte:head>
	<title>{details.chain_name} decentralised exchanges and trading pairs</title>
	<meta name="description" content={`Top ${details.chain_name} tokens and prices`} />
</svelte:head>

<Breadcrumbs labels={{ [details.chain_slug]: details.chain_name }} />

<main>
	<header class="ds-container">
		<h1>
			<img alt={`${details.chain_name} logo`} class="chain-logo" src={details.chain_logo} />
			{details.chain_name} blockchain
		</h1>
	</header>

	<section class="ds-container">
		<table class="table">
			<tbody>
				<tr>
					<th>Homepage</th>
					<td>
						<a class="body-link" href={details.homepage}>
							{formatUrlAsDomain(details.homepage)}
						</a>
					</td>
				</tr>

				<tr>
					<th>
						Exchanges
						<p class="hint">Decentralised exchanges with market data available on Trading Strategy</p>
					</th>
					<td>{details.exchanges}</td>
				</tr>

				<tr>
					<th>
						Tracked trading pairs
						<p class="hint">Total trading pairs on Trading Strategy for this blockchain.</p>
					</th>
					<td>{formatAmount(details.pairs)}</td>
				</tr>

				<tr>
					<th>
						Active trading pairs
						<p class="hint">
							Trading pairs with market data feeds. Active trading pairs have enough trading activity to have data feeds
							generated for them.
							<a rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
								>See the inclusion criteria.</a
							>
						</p>
					</th>
					<td>{formatAmount(details.tracked_pairs)}</td>
				</tr>
			</tbody>
		</table>

		<table class="table">
			<tbody>
				<tr>
					<th>
						First indexed block
						<p class="hint">Starting block when Trading Strategy started collect data</p>
					</th>
					<td>{formatAmount(details.start_block)}</td>
				</tr>

				<tr>
					<th>
						Last indexed block
						<p class="hint">Currently seen last block with available trading data</p>
					</th>
					<td>{formatAmount(details.end_block)}</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="ds-container explorer-wrapper">
		<h2>Exchanges on {details.chain_name}</h2>

		<StaleDataWarning chainSlugs={[details.chain_slug]} />

		<p>Showing exchanges with trading activity in last 30 days.</p>

		<ExchangeExplorer
			chainSlug={details.chain_slug}
			enabledColumns={['human_readable_name', 'pair_count', 'usd_volume_30d']}
			orderColumnIndex={2}
		/>
	</section>

	<section class="ds-container explorer-wrapper">
		<h2>Trading pairs on {details.chain_name}</h2>

		<StaleDataWarning chainSlugs={[details.chain_slug]} />

		<PairExplorer
			chainSlug={details.chain_slug}
			enabledColumns={['pair_name', 'exchange_name', 'usd_price_latest', 'usd_volume_30d', 'usd_liquidity_latest']}
			orderColumnIndex={3}
		/>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 2.5rem;
	}

	section {
		align-items: start;
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	h2 {
		font: var(--f-h3-medium);
	}

	tbody tr:first-child th,
	tbody tr:first-child td {
		border-top: 0;
	}

	.explorer-wrapper {
		grid-template-columns: auto;
		gap: 1rem;
	}

	.chain-logo {
		max-width: 48px;
		max-height: 48px;
	}

	.hint {
		color: var(--c-text-2);
		font-size: 75%;
	}
</style>

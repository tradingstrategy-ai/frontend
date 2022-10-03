<script lang="ts">
	import type { PageData } from './$types';
	import { formatAmount, formatUrlAsDomain } from '$lib/helpers/formatters';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import ExchangeExplorer from '$lib/explorer/ExchangeExplorer.svelte';
	import Header from './Header.svelte';

	export let data: PageData;
</script>

<svelte:head>
	<title>{data.chain_name} decentralised exchanges and trading pairs</title>
	<meta name="description" content={`Top ${data.chain_name} tokens and prices`} />
</svelte:head>

<Breadcrumbs labels={{ [data.chain_slug]: data.chain_name }} />

<main>
	<Header name={data.chain_name} logoUrl={data.chain_logo} homepage={data.homepage} />

	<section class="ds-container ds-2-col" style:align-items="start">
		<table class="table">
			<tbody>
				<tr>
					<th>Homepage</th>
					<td>
						<a class="body-link" href={data.homepage}>
							{formatUrlAsDomain(data.homepage)}
						</a>
					</td>
				</tr>

				<tr>
					<th>
						Exchanges
						<p class="hint">Decentralised exchanges with market data available on Trading Strategy</p>
					</th>
					<td>{data.exchanges}</td>
				</tr>

				<tr>
					<th>
						Tracked trading pairs
						<p class="hint">Total trading pairs on Trading Strategy for this blockchain.</p>
					</th>
					<td>{formatAmount(data.pairs)}</td>
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
					<td>{formatAmount(data.tracked_pairs)}</td>
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
					<td>{formatAmount(data.start_block)}</td>
				</tr>

				<tr>
					<th>
						Last indexed block
						<p class="hint">Currently seen last block with available trading data</p>
					</th>
					<td>{formatAmount(data.end_block)}</td>
				</tr>
			</tbody>
		</table>
	</section>

	<section class="ds-container explorer-wrapper">
		<h2>Exchanges on {data.chain_name}</h2>

		<StaleDataWarning chainSlugs={[data.chain_slug]} />

		<p>Showing exchanges with trading activity in last 30 days.</p>

		<ExchangeExplorer
			chainSlug={data.chain_slug}
			enabledColumns={['human_readable_name', 'pair_count', 'usd_volume_30d']}
			orderColumnIndex={2}
		/>
	</section>

	<section class="ds-container explorer-wrapper">
		<h2>Trading pairs on {data.chain_name}</h2>

		<StaleDataWarning chainSlugs={[data.chain_slug]} />

		<PairExplorer
			chainSlug={data.chain_slug}
			enabledColumns={['pair_name', 'exchange_name', 'usd_price_latest', 'usd_volume_30d', 'usd_liquidity_latest']}
			orderColumnIndex={3}
		/>
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 2.5rem;
	}

	h2 {
		font: var(--f-h3-medium);
	}

	tbody tr:first-child th,
	tbody tr:first-child td {
		border-top: 0;
	}

	.explorer-wrapper {
		gap: 1rem;
	}

	.hint {
		color: var(--c-text-2);
		font-size: 75%;
	}
</style>

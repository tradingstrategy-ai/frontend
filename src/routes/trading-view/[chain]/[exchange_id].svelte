<!--
	Exchange info page with all of its trading pairs.
-->
<script context="module">
	import getApiError from '$lib/chain/getApiError';

	export async function load({ url, params, fetch, session }) {
		const { backendUrl } = session.config;
		const exchange_slug = params.exchange_id;
		const chain_slug = params.chain;

		// Load and render exchange details on the server side
		// https://tradingstrategy.ai/api/explorer/#/Exchange/web_exchange_details
		const encoded = new URLSearchParams({ exchange_slug, chain_slug });
		const apiUrl = `${backendUrl}/exchange-details?${encoded}`;

		const resp = await fetch(apiUrl);

		if (!resp.ok) {
			return getApiError(resp, 'Exchange', [chain_slug, exchange_slug]);
		}

		const details = await resp.json();
		return { props: { chain_slug, details } };
	}
</script>

<script>
	import { formatAmount, formatDollar, formatUnixTimestampAsDate } from '$lib/helpers/formatters';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import ExchangeInfoTable from '$lib/content/ExchangeInfoTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import { parseExchangeName } from '$lib/helpers/exchange';

	export let chain_slug;
	export let details;

	const nameDetails = parseExchangeName(details.human_readable_name);
</script>

<svelte:head>
	<title>
		{details.human_readable_name} on {details.chain_name}
	</title>
	<meta
		name="description"
		content={`Decentralise exchange ${details.human_readable_name} on ${details.chain_name} blockchain`}
	/>
</svelte:head>

<Breadcrumbs labels={{ [details.exchange_slug]: details.human_readable_name }} />

<main>
	<header class="ds-container">
		<h1 data-testid="title">
			{details.human_readable_name} exchange on {details.chain_name}
		</h1>
	</header>

	<section class="ds-container exchange-info" data-testid="statistics">
		<ExchangeInfoTable {details} />

		<div class="text-summary">
			<p>
				<strong>{details.human_readable_name}</strong> is a decentralised exchange on
				<a class="body-link" href="/trading-view/{chain_slug}">{details.chain_name} blockchain</a>.
			</p>

			<p>
				{details.human_readable_name} has 30 days trade volume of
				<strong>{formatDollar((details.buy_volume_30d || 0) + (details.sell_volume_30d || 0))}</strong>
				and all-time volume of
				<strong>{formatDollar((details.buy_volume_all_time || 0) + (details.sell_volume_all_time || 0))}</strong>. The
				first trade happened at
				<strong>{formatUnixTimestampAsDate(details.first_trade_at)}</strong>.
			</p>

			<p>
				{details.human_readable_name} has <strong>{formatAmount(details.pair_count)}</strong>
				token trading pairs of which
				<strong>{formatAmount(details.active_pair_count)}</strong> are
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
					>actively tracked</a
				> by Trading Strategy.
			</p>

			<p class="smart-contract-address">
				The factory smart contract address for {details.human_readable_name} is
				<a class="body-link" href={details.blockchain_explorer_link}>{details.address}</a>.
			</p>
		</div>
	</section>

	<section class="ds-container">
		<div class="exchange-actions">
			<Button secondary label="Visit {nameDetails.name}" href={details.homepage} />
			<Button
				secondary
				label="View {nameDetails.name} on blockchain explorer"
				href={details.blockchain_explorer_link}
			/>
			<Button
				secondary
				label="Download as Excel"
				href="/trading-view/{details.chain_slug}/{details.exchange_slug}/export-data"
			/>
		</div>
	</section>

	<section class="ds-container trading-pairs" data-testid="pairs">
		<h2>Trading Pairs</h2>

		<StaleDataWarning chainSlugs={[details.chain_slug]} />

		<PairExplorer
			chainSlug={details.chain_slug}
			exchangeSlug={details.exchange_slug}
			enabledColumns={[
				'pair_name',
				'usd_price_latest',
				'price_change_24h',
				'usd_volume_30d',
				'usd_liquidity_latest',
				'liquidity_change_24h'
			]}
			orderColumnIndex={3}
		/>
	</section>

	<section class="ds-container">
		<p>
			Not all trading pairs are being displayed or included in volume calculations.
			<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				>See inclusion criteria</a
			>.
		</p>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 1rem;
	}

	header h1 {
		font: var(--f-h2-medium);
	}

	h2 {
		font: var(--f-h3-medium);
	}

	.text-summary {
		align-self: start;
		display: grid;
		gap: 1rem;
	}

	.smart-contract-address {
		overflow: hidden;
		text-overflow: ellipsis;
	}

	.trading-pairs {
		gap: 0.5rem;
	}

	/* Make sure columns do not wiggle when resorting and the data in the cells change */
	.trading-pairs :global td {
		width: 17%; /* 1/6 */
	}

	.exchange-actions {
		margin-bottom: 1rem;
		display: flex;
		flex-wrap: wrap;
		gap: 1.5rem;
	}

	@media (--viewport-lg-up) {
		.exchange-info {
			grid-template-columns: 4fr 5fr;
		}
	}
</style>

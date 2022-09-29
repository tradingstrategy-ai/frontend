<script lang="ts">
	import type { PageData } from './$types';
	import { fromUnixTime } from 'date-fns';
	import { formatAmount, formatDollar } from '$lib/helpers/formatters';
	import { parseExchangeName } from '$lib/helpers/exchange';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import StaleDataWarning from '$lib/chain/StaleDataWarning.svelte';
	import ExchangeInfoTable from '$lib/content/ExchangeInfoTable.svelte';
	import { Button } from '$lib/components';

	export let data: PageData;

	const nameDetails = parseExchangeName(data.human_readable_name);
</script>

<svelte:head>
	<title>
		{data.human_readable_name} on {data.chain_name}
	</title>
	<meta
		name="description"
		content={`Decentralise exchange ${data.human_readable_name} on ${data.chain_name} blockchain`}
	/>
</svelte:head>

<Breadcrumbs labels={{ [data.exchange_slug]: data.human_readable_name }} />

<main>
	<header class="ds-container">
		<h1 data-testid="title">
			{data.human_readable_name} exchange on {data.chain_name}
		</h1>
	</header>

	<section class="ds-container exchange-info" data-testid="statistics">
		<ExchangeInfoTable details={data} />

		<div class="text-summary">
			<p>
				<strong>{data.human_readable_name}</strong> is a decentralised exchange on
				<a class="body-link" href="/trading-view/{data.chain_slug}">{data.chain_name} blockchain</a>.
			</p>

			<p>
				{data.human_readable_name} has 30 days trade volume of
				<strong>{formatDollar((data.buy_volume_30d || 0) + (data.sell_volume_30d || 0))}</strong>
				and all-time volume of
				<strong>{formatDollar((data.buy_volume_all_time || 0) + (data.sell_volume_all_time || 0))}</strong>. The first
				trade happened at
				<strong>
					{#if data.first_trade_at}
						{fromUnixTime(data.first_trade_at).toDateString()}
					{:else}
						(data unavailable)
					{/if}
				</strong>.
			</p>

			<p>
				{data.human_readable_name} has <strong>{formatAmount(data.pair_count)}</strong>
				token trading pairs of which
				<strong>{formatAmount(data.active_pair_count)}</strong> are
				<a class="body-link" rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
					>actively tracked</a
				> by Trading Strategy.
			</p>

			<p class="smart-contract-address">
				The factory smart contract address for {data.human_readable_name} is
				<a class="body-link" href={data.blockchain_explorer_link}>{data.address}</a>.
			</p>
		</div>
	</section>

	<section class="ds-container">
		<div class="exchange-actions">
			<Button secondary label="Visit {nameDetails.name}" href={data.homepage} />
			<Button secondary label="View {nameDetails.name} on blockchain explorer" href={data.blockchain_explorer_link} />
			<Button
				secondary
				label="Download as Excel"
				href="/trading-view/{data.chain_slug}/{data.exchange_slug}/export-data"
			/>
		</div>
	</section>

	<section class="ds-container trading-pairs" data-testid="pairs">
		<h2>Trading Pairs</h2>

		<StaleDataWarning chainSlugs={[data.chain_slug]} />

		<PairExplorer
			chainSlug={data.chain_slug}
			exchangeSlug={data.exchange_slug}
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

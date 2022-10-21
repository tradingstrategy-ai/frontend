<script lang="ts">
	import type { PageData } from './$types';
	import { parseExchangeName } from '$lib/helpers/exchange';
	import { AlertItem, AlertList, Button, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairExplorer from '$lib/explorer/PairExplorer.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';

	export let data: PageData;

	$: nameDetails = parseExchangeName(data.human_readable_name);
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
	<PageHeader title="{data.human_readable_name} exchange" subtitle="on {data.chain_name}" />

	<section class="ds-container info" data-testid="exchange-info">
		<div class="ds-2-col">
			<InfoTable details={data} {nameDetails} />
			<InfoSummary details={data} />
		</div>

		<AlertList>
			<AlertItem title="Uniswap V3 beta" displayWhen={data.exchange_type === 'uniswap_v3'}>
				We are in the process of integrating Uniswap V3 data. This page is available as a beta preview, but please note
				that the data for this exchange is currently incomplete.
			</AlertItem>
		</AlertList>

		<div class="exchange-actions">
			<Button label="Visit {nameDetails.name}" href={data.homepage} />
			<Button label="View {nameDetails.name} on blockchain explorer" href={data.blockchain_explorer_link} />
			<Button label="Download as Excel" href="/trading-view/{data.chain_slug}/{data.exchange_slug}/export-data" />
		</div>
	</section>

	<section class="ds-container trading-pairs" data-testid="trading-pairs">
		<h2>Trading Pairs</h2>

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

	<aside class="ds-container">
		<p>
			Not all trading pairs are being displayed or included in volume calculations.
			<a href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html">See inclusion criteria</a>.
		</p>
	</aside>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: 2.5rem;

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	.info {
		gap: 2.5rem;

		@media (--viewport-lg-up) {
			gap: 3.5rem;
		}

		& .ds-2-col {
			row-gap: 2rem;
		}
	}

	.exchange-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 1.25rem 2rem;
		padding-block: 1.5rem;

		@media (width < 576px) {
			flex-direction: column;
			padding-block: 0;
		}
	}

	.trading-pairs {
		margin-top: 1rem;
		gap: 1rem;

		@media (--viewport-lg-up) {
			margin-top: 1.5rem;
			gap: 1.5rem;
		}
	}

	aside p {
		font: var(--f-ui-large-roman);
		text-align: center;

		& a {
			font-weight: 700;
			text-decoration: underline;
			white-space: nowrap;
		}
	}
</style>

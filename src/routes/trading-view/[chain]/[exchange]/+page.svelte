<script lang="ts">
	import type { PageData } from './$types';
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getPairsClient } from '$lib/explorer/pair-client';
	import { parseExchangeName } from '$lib/helpers/exchange';
	import { AlertItem, AlertList, Button, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairsTable from '$lib/explorer/PairsTable.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';

	export let data: PageData;
	$: ({ exchange } = data);

	$: nameDetails = parseExchangeName(exchange.human_readable_name);

	$: breadcrumbs = {
		[exchange.chain_slug]: exchange.chain_name,
		[exchange.exchange_slug]: exchange.human_readable_name
	};

	// FIXME: it is preferable to use `liquidity_type === 'xyliquidity'` for below conditional,
	// but this is not currently available from `exchange-details` endpoint.
	// See: https://github.com/tradingstrategy-ai/backend/issues/110
	let hiddenColumns: string[];
	$: if (exchange.exchange_type === 'uniswap_v3') {
		hiddenColumns = ['exchange_name', 'liquidity', 'liquidity_change_24h'];
	} else {
		hiddenColumns = ['exchange_name'];
	}

	const pairsClient = getPairsClient(fetch);

	$: $page.route.id?.endsWith('[exchange]') &&
		pairsClient.update({
			chain_slugs: exchange.chain_slug,
			exchange_slugs: exchange.exchange_slug,
			...Object.fromEntries($page.url.searchParams.entries())
		});

	async function handlePairsChange({ detail }: ComponentEvents<PairsTable>['change']) {
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>
		{exchange.human_readable_name} on {exchange.chain_name}
	</title>
	<meta
		name="description"
		content={`Decentralise exchange ${exchange.human_readable_name} on ${exchange.chain_name} blockchain`}
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<PageHeader title="{exchange.human_readable_name} exchange" subtitle="on {exchange.chain_name}" />

	<section class="ds-container info" data-testid="exchange-info">
		<div class="ds-2-col">
			<InfoTable details={exchange} {nameDetails} />
			<InfoSummary details={exchange} />
		</div>

		<AlertList status="warning">
			<AlertItem title="Uniswap v3 beta" displayWhen={exchange.exchange_type === 'uniswap_v3'}>
				We are in the process of integrating Uniswap V3 data. This page is available as a beta preview, but please note
				that the data for this exchange is currently incomplete.
			</AlertItem>

			<AlertItem title="Incompatible exchange" displayWhen={exchange.exchange_type === 'uniswap_v2_incompatible'}>
				{exchange.human_readable_name} is not fully compatible with Uniswap v2 protocols. Price, volume and liquidity data
				for this exchange may be inaccurate.
			</AlertItem>
		</AlertList>

		<div class="exchange-actions">
			<Button label="Visit {nameDetails.name}" href={exchange.homepage} />
			<Button label="View {nameDetails.name} on blockchain explorer" href={exchange.blockchain_explorer_link} />
			<Button
				label="Download as Excel"
				href="/trading-view/{exchange.chain_slug}/{exchange.exchange_slug}/export-data"
			/>
		</div>
	</section>

	<section class="ds-container trading-pairs">
		<h2>Trading Pairs</h2>

		{#if !$pairsClient.error}
			<PairsTable {...$pairsClient} {hiddenColumns} on:change={handlePairsChange} />
		{:else}
			<AlertList>
				<AlertItem>
					An error occurred loading the pairs data. Check the URL parameters for errors and try reloading the page.
				</AlertItem>
			</AlertList>
		{/if}
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
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	.info {
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: var(--space-6xl);
		}

		& .ds-2-col {
			row-gap: var(--space-xl);
		}
	}

	.exchange-actions {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: var(--space-ls) var(--space-xl);
		padding-block: var(--space-lg);

		@media (--viewport-xs) {
			flex-direction: column;
			padding-block: 0;
		}
	}

	h2 {
		font: var(--f-h2-medium);
	}

	.trading-pairs {
		margin-top: var(--space-md);
		gap: var(--space-md);

		@media (--viewport-lg-up) {
			margin-top: var(--space-lg);
			gap: var(--space-lg);
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

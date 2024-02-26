<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getPairsClient } from '$lib/explorer/pair-client';
	import { parseExchangeName } from '$lib/helpers/exchange';
	import { Alert, Button, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import PairTable from '$lib/explorer/PairTable.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';

	export let data;
	$: ({ exchange } = data);

	$: nameDetails = parseExchangeName(exchange.human_readable_name);

	$: breadcrumbs = {
		[exchange.chain_slug]: exchange.chain_name,
		[exchange.exchange_slug]: exchange.human_readable_name
	};

	const pairsClient = getPairsClient(fetch);

	$: $page.route.id?.endsWith('[exchange]') &&
		pairsClient.update({
			chain_slugs: exchange.chain_slug,
			exchange_slugs: exchange.exchange_slug,
			...Object.fromEntries($page.url.searchParams.entries())
		});

	async function handlePairsChange({ detail }: ComponentEvents<PairTable>['change']) {
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

		{#if exchange.exchange_type === 'uniswap_v2_incompatible'}
			<Alert status="warning" title="Incompatible exchange">
				{exchange.human_readable_name} is not fully compatible with Uniswap v2 protocols. Price, volume and liquidity data
				for this exchange may be inaccurate.
			</Alert>
		{/if}

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
			<PairTable
				{...$pairsClient}
				hideChainIcon
				hiddenColumns={['exchange_name', 'liquidity', 'liquidity_change_24h']}
				on:change={handlePairsChange}
			/>
		{:else}
			<Alert>
				An error occurred loading the pairs data. Check the URL parameters for errors and try reloading the page.
			</Alert>
		{/if}
	</section>

	<aside class="ds-container">
		<p>
			Not all trading pairs are being displayed or included in volume calculations.
			<a
				class="body-link"
				href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				target="_blank"
				rel="external">See inclusion criteria</a
			>.
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

		.ds-2-col {
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
	}
</style>

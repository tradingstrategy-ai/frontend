<script lang="ts">
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { getPairsClient } from '$lib/explorer/pair-client';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { Alert, EntitySymbol, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import PairTable from '$lib/explorer/PairTable.svelte';

	export let data;
	$: ({ token, reserves } = data);

	$: breadcrumbs = {
		[token.chain_slug]: token.chain_name,
		[token.address]: token.name
	};

	const pairsClient = getPairsClient(fetch);

	$: $page.route.id?.endsWith('[token]') &&
		pairsClient.update({
			chain_slugs: token.chain_slug,
			token_addresses: token.address,
			...Object.fromEntries($page.url.searchParams.entries())
		});

	async function handlePairsChange({ detail }: ComponentEvents<PairTable>['change']) {
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>
		{token.symbol} on {token.chain_name}
	</title>
	<meta
		name="description"
		content={`${token.name} (${token.symbol} ${getTokenStandardName(token.chain_slug)} on ${token.chain_name})`}
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main>
	<PageHeader title={token.name}>
		<span slot="subtitle" class="subtitle">
			token trading as {token.symbol} on
			<EntitySymbol size="0.875em" label={token.chain_name} logoUrl={getLogoUrl('blockchain', token.chain_slug)} />
		</span>
	</PageHeader>

	<section class="ds-container ds-2-col info" data-testid="token-info">
		<InfoTable {token} />
		<InfoSummary {token} {reserves} />
	</section>

	<section class="ds-container blockchain-alert">
		<Alert status="info" size="md">
			The information on this page is for <a href="/trading-view/{token.chain_slug}">{token.chain_name}</a>.
			<strong>{token.symbol}</strong> presentations bridged and wrapped on other blockchains are not included in the figures.
		</Alert>
	</section>

	<section class="ds-container trading-pairs">
		<h2>Trading pairs</h2>

		{#if !$pairsClient.error}
			<PairTable
				{...$pairsClient}
				hideChainIcon
				hiddenColumns={['liquidity', 'liquidity_change_24h']}
				on:change={handlePairsChange}
			/>
		{:else}
			<Alert>
				An error occurred loading the pairs data. Check the URL parameters for errors and try reloading the page.
			</Alert>
		{/if}

		<p class="inclusion-notice">
			Trading pairs with complications (such as low liquidity) may not be displayed.
			<a
				class="body-link"
				href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				target="_blank"
				rel="external"
			>
				Read the rules for tracked trading pairs.
			</a>
		</p>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 2.5rem;

		@media (--viewport-lg-up) {
			gap: 5rem;
		}

		:global(h1) {
			overflow: hidden;
			text-overflow: ellipsis;
		}

		h2 {
			font: var(--f-h2-medium);
		}

		.subtitle {
			display: flex;
			flex-wrap: wrap;
			gap: 0.5ex;
		}

		.info {
			align-items: start;
		}

		.blockchain-alert {
			@media (--viewport-lg-up) {
				margin-top: -2.5rem;
			}
		}

		.trading-pairs {
			gap: 1.5rem;
		}

		.inclusion-notice {
			font: var(--f-ui-large-roman);
			text-align: center;
		}
	}
</style>

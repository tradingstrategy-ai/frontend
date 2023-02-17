<script lang="ts">
	import type { PageData } from './$types';
	import type { ComponentEvents } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { fetchPairs, type PairIndexResponse } from '$lib/explorer/pair-client';
	import { getTokenStandardName } from '$lib/chain/tokenstandard';
	import { AlertItem, AlertList, PageHeader } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import PairsTable from '$lib/explorer/PairsTable.svelte';

	export let data: PageData;

	let pairsData: PairIndexResponse;
	let pairsLoading = true;
	let pairsError = false;

	$: updatePairsData($page.url.searchParams);

	async function updatePairsData(searchParams: URLSearchParams) {
		pairsLoading = true;

		try {
			pairsData = await fetchPairs(fetch, {
				chain_slugs: data.chain_slug,
				token_addresses: data.address,
				...Object.fromEntries(searchParams.entries())
			});
		} catch (e) {
			pairsError = true;
			console.log(e);
		}

		pairsLoading = false;
	}

	async function handlePairsChange({ detail }: ComponentEvents<PairsTable>['change']) {
		await goto('?' + new URLSearchParams(detail.params), { noScroll: true });
		detail.scrollToTop();
	}
</script>

<svelte:head>
	<title>
		{data.symbol} on {data.chain_name}
	</title>
	<meta
		name="description"
		content={`${data.name} (${data.symbol} ${getTokenStandardName(data.chain_slug)} on ${data.chain_name}`}
	/>
</svelte:head>

<Breadcrumbs labels={{ [data.address]: data.name }} />

<main>
	<PageHeader title={data.name} subtitle="token trading as {data.symbol} on {data.chain_name}" />

	<section class="ds-container ds-2-col info" data-testid="token-info">
		<InfoTable {data} />
		<InfoSummary {data} />
	</section>

	<section class="ds-container trading-pairs" data-testid="trading-pairs">
		<h2>Trading pairs</h2>

		{#if !pairsError}
			<PairsTable data={pairsData} loading={pairsLoading} on:change={handlePairsChange} />
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
			Trading pairs with complications (such as low liquidity) may not be displayed.
			<a rel="external" href="https://tradingstrategy.ai/docs/programming/market-data/tracking.html"
				>Read the rules for tracked trading pairs.</a
			>
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

	h2 {
		font: var(--f-h2-medium);
	}

	.info {
		align-items: start;
	}

	.trading-pairs {
		gap: var(--space-lg);
	}

	aside {
		& p {
			margin-top: 0;
			font: var(--f-ui-large-roman);
		}

		& a {
			font-weight: 700;
			text-decoration: underline;
		}
	}
</style>

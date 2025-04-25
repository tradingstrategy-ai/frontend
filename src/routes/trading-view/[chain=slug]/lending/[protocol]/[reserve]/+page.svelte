<script lang="ts">
	import { page } from '$app/state';
	import { replaceState } from '$app/navigation';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import EntitySymbol from '$lib/components/EntitySymbol.svelte';
	import PageHeader from '$lib/components/PageHeader.svelte';
	import Section from '$lib/components/Section.svelte';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import ReserveInterestChart from '$lib/charts/ReserveInterestChart.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import { OptionGroup } from '$lib/helpers/option-group.svelte';
	import { timeBucketEnum } from '$lib/schemas/utility';
	import { getFormattedReserveUSD, isBorrowable, lendingReserveExternalUrl } from '$lib/helpers/lending-reserve';
	import { formatUrlAsDomain } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	let { reserve } = $derived(data);

	let breadcrumbs = $derived({
		[reserve.chain_slug]: reserve.chain_name,
		lending: 'Lending',
		[reserve.protocol_slug]: reserve.protocol_name,
		[reserve.reserve_slug]: reserve.asset_symbol
	});

	let formattedReserveUSD = $derived(getFormattedReserveUSD(reserve));

	let reserveUrl = $derived(lendingReserveExternalUrl(reserve));

	// Hide chart for Aave v3 GHO token as well as non-borrowable reserves
	// see: https://docs-gho.vercel.app/concepts/overview
	let isGhoToken = $derived(reserve.protocol_slug === 'aave_v3' && reserve.asset_symbol === 'GHO');
	let borrowable = $derived(isBorrowable(reserve));
	let showChart = $derived(borrowable && !isGhoToken);

	const validTimeBuckets = timeBucketEnum.exclude(['1m', '5m', '15m']).options;
	let timeBucket = new OptionGroup(validTimeBuckets, page.state.timeBucket ?? data.timeBucket);

	function handleTimeBucketChange({ detail: { name, value } }: CustomEvent) {
		if (name !== 'timeBucket') return;
		replaceState(`?${new URLSearchParams({ timeBucket: value })}`, { timeBucket: value });
	}
</script>

<svelte:head>
	<title>{reserve.asset_symbol} {reserve.protocol_name} reserve on {reserve.chain_name}</title>
	<meta
		name="description"
		content="{reserve.asset_name} lending reserve on {reserve.protocol_name} protocol on {reserve.chain_name}"
	/>
</svelte:head>

<Breadcrumbs labels={breadcrumbs} />

<main class="ds-3">
	<PageHeader title={reserve.asset_name}>
		<span slot="subtitle" class="subtitle">
			{reserve.protocol_name}
			reserve on
			<EntitySymbol size="0.875em" label={reserve.chain_name} logoUrl={getLogoUrl('blockchain', reserve.chain_slug)} />
		</span>
		<svelte:fragment slot="cta">
			{#if reserveUrl}
				<Button href={reserveUrl} target="_blank" rel="noreferrer">
					View on {formatUrlAsDomain(reserveUrl)}
				</Button>
			{/if}
		</svelte:fragment>
	</PageHeader>

	<section class="ds-container info" data-testid="reserve-info">
		<div class="ds-2-col">
			<InfoTable {reserve} {borrowable} />
			<InfoSummary {reserve} {borrowable} />
		</div>

		{#if borrowable && formattedReserveUSD?.borrowingEnabled === false}
			<Alert status="error">
				Borrowing is disabled due to an Aave community decision.
				<a href="https://app.aave.com/governance/" target="_blank" rel="noreferrer">More details</a>
			</Alert>
		{/if}
	</section>

	{#if showChart}
		<Section>
			<ReserveInterestChart {reserve} {timeBucket} on:change={handleTimeBucketChange} />
		</Section>
	{/if}
</main>

<style>
	main {
		display: grid;
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: 5rem;
		}
	}

	.subtitle {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5ex;
	}

	.info {
		gap: var(--space-3xl);

		@media (--viewport-lg-up) {
			gap: var(--space-6xl);
		}

		.ds-2-col {
			row-gap: var(--space-xl);
			align-items: start;
		}
	}
</style>

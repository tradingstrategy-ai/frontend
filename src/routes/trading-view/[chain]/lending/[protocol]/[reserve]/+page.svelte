<script lang="ts">
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import type { RateType } from '$lib/chart/ReserveInterestChart.svelte';
	import { type TimeBucket, ReserveInterestChart } from '$lib/chart';
	import { Alert, Button, PageHeader, Section, SegmentedControl } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import { getFormattedReserveUSD, isBorrowable, lendingReserveUrl } from '$lib/helpers/lending-reserve';
	import { formatUrlAsDomain } from '$lib/helpers/formatters';

	export let data;
	$: ({ reserve } = data);

	$: breadcrumbs = {
		[reserve.chain_slug]: reserve.chain_name,
		lending: 'Lending',
		[reserve.protocol_slug]: reserve.protocol_name,
		[reserve.reserve_slug]: reserve.asset_symbol
	};

	$: formattedReserveUSD = getFormattedReserveUSD(reserve);

	$: reserveUrl = lendingReserveUrl(reserve.chain_slug, reserve.protocol_slug, reserve.asset_address);

	// Hide chart for Aave v3 GHO token as well as non-borrowable reserves
	// see: https://docs-gho.vercel.app/concepts/overview
	$: isGhoToken = reserve.protocol_slug === 'aave_v3' && reserve.asset_symbol === 'GHO';
	$: borrowable = isBorrowable(reserve);
	$: showChart = borrowable && !isGhoToken;

	let timeBucket: TimeBucket = '1d';

	function getSecondaryRates({ additional_details: details }: LendingReserve) {
		const rates: RateType[] = ['supply_apr'];
		if (details.aggregated_reserve_data?.stableBorrowRateEnabled) {
			rates.push('stable_borrow_apr');
		}
		return rates;
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

<main>
	<PageHeader title={reserve.asset_name} subtitle="{reserve.protocol_name} reserve on {reserve.chain_name}">
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
				<a href="https://app.aave.com/governance/" target="_blank" rel="external">More details</a>
			</Alert>
		{/if}
	</section>
</main>

{#if showChart}
	<Section padding="md">
		<div class="chart-header">
			<h3>Interest rates</h3>
			<SegmentedControl options={['1h', '4h', '1d', '7d', '30d']} bind:selected={timeBucket} />
		</div>
		<ReserveInterestChart
			{reserve}
			{timeBucket}
			primaryRate="variable_borrow_apr"
			secondaryRates={getSecondaryRates(reserve)}
		/>
	</Section>
{/if}

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
			align-items: start;
		}
	}

	.chart-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
		border-bottom: 1px solid #999;
		padding-bottom: 0.5rem;

		& h3 {
			flex: 1;
			font: var(--f-h5-medium);
			margin: 0;
			text-transform: uppercase;
			letter-spacing: 0.06em;
			white-space: nowrap;

			@media (--viewport-xs) {
				font: var(--f-h6-medium);
			}
		}
	}
</style>

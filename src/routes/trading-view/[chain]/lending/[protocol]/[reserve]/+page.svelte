<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Button, PageHeader, Section, SegmentedControl } from '$lib/components';
	import { type TimeBucket, ReserveInterestChart } from '$lib/chart';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import { isBorrowable, lendingReserveUrl } from '$lib/helpers/lending-reserve';
	import { formatUrlAsDomain } from '$lib/helpers/formatters';
	import { formatReserveUSD } from '@aave/math-utils';

	export let data;
	$: ({ reserve } = data);

	$: breadcrumbs = {
		[reserve.chain_slug]: reserve.chain_name,
		lending: 'Lending',
		[reserve.protocol_slug]: reserve.protocol_name,
		[reserve.reserve_slug]: reserve.asset_symbol
	};

	$: reserveUrl = lendingReserveUrl(reserve.chain_slug, reserve.protocol_slug, reserve.asset_address);

	// Hide chart for Aave v3 GHO token as well as non-borrowable reserves
	// see: https://docs-gho.vercel.app/concepts/overview
	$: isGhoToken = reserve.protocol_slug === 'aave_v3' && reserve.asset_symbol === 'GHO';
	$: borrowable = isBorrowable(reserve);
	$: showChart = borrowable && !isGhoToken;

	let timeBucket: TimeBucket = '1d';

	$: console.log(getAaveData(reserve.additional_details));

	function getAaveData({ aggregated_reserve_data: reserveData, base_currency_info: baseCurrency }) {
		const numberProps = [
			'decimals',
			'stableDebtLastUpdateTimestamp',
			'lastUpdateTimestamp',
			'eModeCategoryId',
			'debtCeilingDecimals',
			'eModeLtv',
			'eModeLiquidationThreshold',
			'eModeLiquidationBonus'
		];
		if (reserveData) {
			for (const key of numberProps) {
				reserveData[key] &&= Number(reserveData[key]);
			}
		}
		const currentTimestamp = Math.floor(Date.now() / 1000);
		const marketReferencePriceInUsd = baseCurrency.marketReferenceCurrencyPriceInUsd;
		const marketReferenceCurrencyDecimals = Math.log10(baseCurrency.marketReferenceCurrencyUnit);
		return formatReserveUSD({
			reserve: reserveData,
			currentTimestamp,
			marketReferencePriceInUsd,
			marketReferenceCurrencyDecimals
		});
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

	<section class="ds-container ds-2-col info" data-testid="reserve-info">
		<InfoTable {reserve} {borrowable} />
		<InfoSummary {reserve} {borrowable} />
	</section>
</main>

{#if showChart}
	<Section padding="md">
		<div class="chart-header">
			<h3>Interest rates</h3>
			<SegmentedControl options={['1h', '4h', '1d', '7d', '30d']} bind:selected={timeBucket} />
		</div>
		<ReserveInterestChart {reserve} {timeBucket} rateType="variable_borrow_apr" />
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
		align-items: flex-start;
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

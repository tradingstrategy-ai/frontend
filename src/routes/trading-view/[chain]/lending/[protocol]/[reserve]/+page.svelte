<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { type TimeBucket, ReserveInterestChart } from '$lib/chart';
	import { Alert, Button, EntitySymbol, PageHeader, Section, SegmentedControl } from '$lib/components';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import InfoTable from './InfoTable.svelte';
	import InfoSummary from './InfoSummary.svelte';
	import { getFormattedReserveUSD, isBorrowable, lendingReserveExternalUrl } from '$lib/helpers/lending-reserve';
	import { formatUrlAsDomain } from '$lib/helpers/formatters';
	import { getLogoUrl } from '$lib/helpers/assets';

	export let data;
	$: ({ reserve } = data);

	$: breadcrumbs = {
		[reserve.chain_slug]: reserve.chain_name,
		lending: 'Lending',
		[reserve.protocol_slug]: reserve.protocol_name,
		[reserve.reserve_slug]: reserve.asset_symbol
	};

	$: formattedReserveUSD = getFormattedReserveUSD(reserve);

	$: reserveUrl = lendingReserveExternalUrl(reserve);

	// Hide chart for Aave v3 GHO token as well as non-borrowable reserves
	// see: https://docs-gho.vercel.app/concepts/overview
	$: isGhoToken = reserve.protocol_slug === 'aave_v3' && reserve.asset_symbol === 'GHO';
	$: borrowable = isBorrowable(reserve);
	$: showChart = borrowable && !isGhoToken;

	$: timeBucket = ($page.url.hash.slice(1) || '1d') as TimeBucket;
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
			<div class="chart-header">
				<h3>Interest rates</h3>
				<SegmentedControl
					options={['1h', '4h', '1d', '7d', '30d']}
					selected={timeBucket}
					on:change={({ target }) => goto(`#${target.value}`, { replaceState: true, noScroll: true })}
				/>
			</div>
			<ReserveInterestChart {reserve} {timeBucket} primaryRate="variable_borrow_apr" secondaryRates={['supply_apr']} />
		</Section>
	{/if}
</main>

<style lang="postcss">
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

	.chart-header {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: var(--space-md);
		border-bottom: 1px solid #999;
		padding-bottom: 0.5rem;

		h3 {
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

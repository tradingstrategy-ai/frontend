<!--
Tokenised fund listing for vaults with a regulated fund structure.
-->
<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import Alert from '$lib/components/Alert.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import { formatDollar } from '$lib/helpers/formatters';
	import TopVaultsOptIn from '$lib/top-vaults/TopVaultsOptIn.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import MarketSharePieChart from '../MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../MarketShareWidgetBox.svelte';

	let { data } = $props();
	let topVaults = $derived(data.initialTopVaults);

	const title = 'Tokenised funds';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
	let totalNavUsd = $derived(data.totalNavUsd);
	let fundCount = $derived(data.fundCount);
	let description = $derived(
		`Tracking ${formatDollar(totalNavUsd, 2, 3)} total net asset value of ${fundCount} tokenised funds.`
	);
	let chartTitle = $derived(`Total ${formatDollar(totalNavUsd, 2, 3)} tokenised fund NAV`);
	let chartFunds = $derived(data.fundChartItems);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: title,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: data.listingSummary.matchingCount
		}
	}}
/>

<main class="tokenised-fund-index-page ds-3">
	<Section tag="header">
		<div class="header-stack">
			<VaultListingsSelector />

			<div class="tokenised-fund-index-header">
				<div class="intro-column">
					<HeroBanner {title}>
						{#snippet subtitle()}
							<p>
								{#if topVaults}
									Tracking {formatDollar(totalNavUsd, 2, 3)} net asset value across {fundCount}
									{fundCount === 1 ? 'fund' : 'funds'}.
								{:else}
									Loading tokenised fund net asset value.
								{/if}
							</p>
							<p>
								Tokenised funds are often similar to vaults, but with a different compliance structure. Tokenised funds
								offer varying levels of transparency, and all data may not be available.
								<a href={resolve('/glossary/tokenised-fund')}
									>Read more about the differences between vaults and tokenised funds here.</a
								>
							</p>
						{/snippet}
					</HeroBanner>
				</div>

				<div class="chart-column">
					<MarketShareWidgetBox title={chartTitle}>
						{#if topVaults}
							<MarketSharePieChart
								items={chartFunds}
								groupLabel="Fund"
								groupLabelPlural="funds"
								otherThreshold={0}
								maxIndividualSlices={7}
								showLabelLogos
								wrapLabels
								valueLabel="Net asset value"
								testId="tokenised-fund-nav-pie-chart"
							/>
						{/if}
					</MarketShareWidgetBox>
				</div>
			</div>
		</div>
	</Section>

	<Section padding="sm">
		{#if topVaults}
			<TopVaultsTable
				{topVaults}
				showFilters
				defaultTvlKey="10k"
				defaultHideUnknown={0}
				progressive={data.initialVaultListingHasMore}
				listingKey={data.listingKey}
				listingSummary={data.listingSummary}
				totalVaultCount={data.totalVaultCount}
			/>
		{:else}
			<Alert title="Error">No tokenised fund data available.</Alert>
		{/if}
	</Section>

	<Section>
		<TopVaultsOptIn />
	</Section>
</main>

<style>
	.tokenised-fund-index-page {
		.header-stack {
			display: grid;
			gap: 1rem;
		}

		.tokenised-fund-index-header {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(25rem, 40rem);
			gap: 1.5rem;
			align-items: stretch;
		}

		.intro-column,
		.chart-column {
			display: grid;
		}

		.intro-column {
			align-content: start;
		}

		.intro-column :global(.subtitle a) {
			text-decoration: underline;
			text-underline-offset: 0.15em;
		}

		.chart-column :global(.metrics-box) {
			height: 100%;
		}

		.chart-column :global(.market-share-pie-chart) {
			align-self: stretch;
		}

		@media (--viewport-sm-down) {
			.tokenised-fund-index-header {
				grid-template-columns: 1fr;
			}
		}
	}
</style>

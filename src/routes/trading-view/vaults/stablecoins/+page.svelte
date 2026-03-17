<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { getStablecoinLogoUrl } from '$lib/stablecoin-metadata/helpers.js';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import MarketSharePieChart from '../MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../MarketShareWidgetBox.svelte';

	let { data } = $props();
	let { stablecoins, chartStablecoins, options } = $derived(data);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	const pageTitle = 'Vaults by stablecoin';
	const description =
		'DeFi vaults for different stablecoins. TVL represents deposits of a stablecoin in vaults. APY represents the yield of last thirty days.';
	const glossaryLinks = {
		defi: resolve('/glossary/defi'),
		vault: resolve('/glossary/vault'),
		stablecoin: resolve('/glossary/stablecoin'),
		tvl: resolve('/glossary/total-value-locked-tvl'),
		apy: resolve('/glossary/apy')
	};
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	title={pageTitle}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title: pageTitle, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title: pageTitle, description }}
/>

<JsonLd
	schema={{
		'@context': 'http://schema.org',
		'@type': 'CollectionPage',
		name: pageTitle,
		description,
		url: pageUrl,
		provider: { '@type': 'Organization', name: 'Trading Strategy' },
		mainEntity: {
			'@type': 'ItemList',
			numberOfItems: stablecoins.length
		}
	}}
/>

<main class="stablecoin-index-page">
	<Section tag="header">
		<div class="header-stack">
			<VaultListingsSelector />

			<div class="stablecoin-index-header">
				<div class="intro-column">
					<HeroBanner>
						{#snippet title()}
							<span>{pageTitle}</span>
							<DataBadge class="badge" status="beta">Beta</DataBadge>
						{/snippet}
						{#snippet subtitle()}
							<a class="body-link" href={glossaryLinks.defi}>DeFi</a>
							<a class="body-link" href={glossaryLinks.vault}>vaults</a>
							for different
							<a class="body-link" href={glossaryLinks.stablecoin}>stablecoins</a>.
							<a class="body-link" href={glossaryLinks.tvl}>TVL</a>
							represents deposits of a stablecoin in vaults.
							<a class="body-link" href={glossaryLinks.apy}>APY</a>
							represents the yield of last thirty days.
						{/snippet}
					</HeroBanner>
				</div>

				<div class="chart-column">
					<MarketShareWidgetBox title="Market share by TVL">
						<MarketSharePieChart
							items={chartStablecoins}
							groupLabel="Stablecoin"
							groupLabelPlural="stablecoins"
							testId="stablecoin-tvl-pie-chart"
						/>
					</MarketShareWidgetBox>
				</div>
			</div>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Stablecoin"
			includeFullName
			getLogoHref={getStablecoinLogoUrl}
			rows={stablecoins}
			{...options}
			{onChange}
		/>
	</Section>
</main>

<style>
	.stablecoin-index-page {
		.header-stack {
			display: grid;
			gap: 1rem;
		}

		.stablecoin-index-header {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(25rem, 40rem);
			gap: 1.5rem;
			align-items: stretch;
		}

		.intro-column {
			display: grid;
			align-content: start;
		}

		.chart-column {
			display: grid;
		}

		.chart-column :global(.metrics-box) {
			height: 100%;
		}

		.chart-column :global(.market-share-pie-chart) {
			align-self: stretch;
		}

		:global(.badge) {
			font-size: 0.44em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}

		@media (--viewport-sm-down) {
			.stablecoin-index-header {
				grid-template-columns: 1fr;
			}
		}
	}
</style>

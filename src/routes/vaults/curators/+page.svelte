<!--
Vault curators index — lists every curator managing at least one vault, with
aggregate TVL, vault count and average APY, plus a market-share pie chart.
-->
<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { formatDollar } from '$lib/helpers/formatters';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import MarketSharePieChart from '../MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../MarketShareWidgetBox.svelte';

	let { data } = $props();
	let { curators, curatorLogos, chartCurators, options } = $derived(data);
	let totalTvl = $derived(curators.reduce((total, curator) => total + curator.tvl, 0));
	let totalTvlLabel = $derived(`${formatDollar(totalTvl / 1_000_000_000, 1, 1, { notation: 'standard' })} billion`);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	function getHref(slug: string) {
		return resolve(`/vaults/curators/${slug}`);
	}

	const title = 'Stablecoin vault curators';
	const description =
		'Curator rankings for DeFi stablecoin vaults. Curators select and manage vault strategies. TVL represents stablecoin deposits across a curator’s vaults. APY represents the yield of last thirty days.';
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
			numberOfItems: curators.length
		}
	}}
/>

<main class="curator-index-page">
	<Section tag="header">
		<div class="header-stack">
			<VaultListingsSelector />

			<div class="curator-index-header">
				<div class="intro-column">
					<HeroBanner>
						{#snippet title()}
							<span>Stablecoin vault curators</span>
						{/snippet}
						{#snippet subtitle()}
							<p>
								Curator rankings for
								<a class="body-link" href={glossaryLinks.defi}>DeFi</a>
								<a class="body-link" href={glossaryLinks.stablecoin}>stablecoin</a>
								<a class="body-link" href={glossaryLinks.vault}>vaults</a>. Curators select and manage vault strategies.
								<a class="body-link" href={glossaryLinks.tvl}>TVL</a> represents stablecoin deposits across a curator’s
								vaults.
								<a class="body-link" href={glossaryLinks.apy}>APY</a>
								represents the yield of last thirty days.
							</p>
							<p>{totalTvlLabel} TVL tracked across {curators.length} curators.</p>
						{/snippet}
					</HeroBanner>
				</div>

				<div class="chart-column">
					<MarketShareWidgetBox title="Market share by TVL">
						<MarketSharePieChart
							items={chartCurators}
							groupLabel="Curator"
							groupLabelPlural="curators"
							testId="curator-tvl-pie-chart"
						/>
					</MarketShareWidgetBox>
				</div>
			</div>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Curator"
			wideName
			rows={curators}
			getLogoHref={(slug) => curatorLogos[slug]}
			{...options}
			{onChange}
			{getHref}
		/>
	</Section>
</main>

<style>
	.curator-index-page {
		.header-stack {
			display: grid;
			gap: 1rem;
		}

		.curator-index-header {
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

		@media (--viewport-sm-down) {
			.curator-index-header {
				grid-template-columns: 1fr;
			}
		}
	}
</style>

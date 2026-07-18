<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { formatDollar } from '$lib/helpers/formatters';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import MarketSharePieChart from '../MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../MarketShareWidgetBox.svelte';

	let { data } = $props();
	let { chains, chartChains, options } = $derived(data);
	let totalTvl = $derived(chains.reduce((total, chain) => total + chain.tvl, 0));
	let totalTvlLabel = $derived(`${formatDollar(totalTvl / 1_000_000_000, 1, 1, { notation: 'standard' })} billion`);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	function getHref(slug: string) {
		return resolve(`/vaults/chains/${slug}`);
	}

	const title = 'DeFi stablecoin vaults by chain';
	const description =
		'DeFi stablecoin vaults on each blockchain. TVL represents stablecoin deposits in vaults on a particular chain. APY represents the yield of last thirty days.';
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
			numberOfItems: chains.length
		}
	}}
/>

<main class="chain-index-page">
	<Section tag="header">
		<div class="header-stack">
			<VaultListingsSelector />

			<div class="chain-index-header">
				<div class="intro-column">
					<HeroBanner>
						{#snippet title()}
							<span>DeFi vaults by chain</span>
						{/snippet}
						{#snippet subtitle()}
							<p>
								<a class="body-link" href={glossaryLinks.defi}>DeFi</a>
								<a class="body-link" href={glossaryLinks.stablecoin}>stablecoin</a>
								<a class="body-link" href={glossaryLinks.vault}>vaults</a>
								on each blockchain.
								<a class="body-link" href={glossaryLinks.tvl}>TVL</a> represents stablecoin deposits in vaults on a
								particular chain.
								<a class="body-link" href={glossaryLinks.apy}>APY</a>
								represents the yield of last thirty days.
							</p>
							<p>{totalTvlLabel} TVL tracked across {chains.length} chains.</p>
						{/snippet}
					</HeroBanner>
				</div>

				<div class="chart-column">
					<MarketShareWidgetBox title="Market share by TVL">
						<MarketSharePieChart
							items={chartChains}
							groupLabel="Chain"
							groupLabelPlural="chains"
							testId="chain-tvl-pie-chart"
						/>
					</MarketShareWidgetBox>
				</div>
			</div>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Chain"
			rows={chains}
			getLogoHref={(slug) => getLogoUrl('blockchain', slug)}
			{...options}
			{onChange}
			{getHref}
		/>
	</Section>
</main>

<style>
	.chain-index-page {
		.header-stack {
			display: grid;
			gap: 1rem;
		}

		.chain-index-header {
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
			.chain-index-header {
				grid-template-columns: 1fr;
			}
		}
	}
</style>

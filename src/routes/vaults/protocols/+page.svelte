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
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { MetaTags, JsonLd } from 'svelte-meta-tags';
	import MarketSharePieChart from '../MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../MarketShareWidgetBox.svelte';

	let { data } = $props();
	let { protocols, chartProtocols, options } = $derived(data);
	let totalTvl = $derived(protocols.reduce((total, protocol) => total + protocol.tvl, 0));
	let totalTvlLabel = $derived(`${formatDollar(totalTvl / 1_000_000_000, 1, 1, { notation: 'standard' })} billion`);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	const title = 'DeFi stablecoin vault protocols | Trading Strategy';
	const description =
		'DeFi stablecoin vaults grouped by protocol. Vaults are built on different digital asset management protocols, and this listing shows the relative popularity of each. TVL represents stablecoin deposits in a protocol’s vaults. APY represents the yield of the last thirty days.';
	const glossaryLinks = {
		vault: resolve('/glossary/vault'),
		protocol: resolve('/glossary/protocol'),
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
			numberOfItems: protocols.length
		}
	}}
/>

<main class="protocol-index-page">
	<Section tag="header">
		<div class="header-stack">
			<VaultListingsSelector />

			<div class="protocol-index-header">
				<div class="intro-column">
					<HeroBanner>
						{#snippet title()}
							<span>Vault protocols</span>
						{/snippet}
						{#snippet subtitle()}
							<p>
								<a class="body-link" href={glossaryLinks.vault}>Vaults</a>
								grouped by
								<a class="body-link" href={glossaryLinks.protocol}>protocol</a>. Vaults are built on different digital
								asset management protocols, and this listing shows the relative popularity of each.
								<a class="body-link" href={glossaryLinks.tvl}>TVL</a>
								represents
								<a class="body-link" href={glossaryLinks.stablecoin}>stablecoin</a>
								deposits in a protocol’s vaults.
								<a class="body-link" href={glossaryLinks.apy}>APY</a>
								represents the yield of the last thirty days.
							</p>
							<p>{totalTvlLabel} TVL tracked across {protocols.length} protocols.</p>
						{/snippet}
					</HeroBanner>
				</div>

				<div class="chart-column">
					<MarketShareWidgetBox title="Market share by TVL">
						<MarketSharePieChart
							items={chartProtocols}
							groupLabel="Protocol"
							groupLabelPlural="protocols"
							testId="protocol-tvl-pie-chart"
						/>
					</MarketShareWidgetBox>
				</div>
			</div>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Protocol"
			includeCore3Risk
			getLogoHref={getVaultProtocolLogoUrl}
			rows={protocols}
			{...options}
			{onChange}
		/>
	</Section>
</main>

<style>
	.protocol-index-page {
		.header-stack {
			display: grid;
			gap: 1rem;
		}

		.protocol-index-header {
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
			.protocol-index-header {
				grid-template-columns: 1fr;
			}
		}
	}
</style>

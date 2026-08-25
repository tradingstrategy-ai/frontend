<!--
Vault protocols index page.
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
	import { riskRatingProviders } from '$lib/top-vaults/risk-rating-providers';
	import { formatDollar } from '$lib/helpers/formatters';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupIndexHeader from '../VaultGroupIndexHeader.svelte';
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

			<VaultGroupIndexHeader>
				<div class="intro-column">
					<HeroBanner>
						{#snippet title()}
							<span>Vault protocols</span>
						{/snippet}
						{#snippet subtitle()}
							<p>
								Vault protocols ranking for DeFi stablecoin vaults.
								<a class="body-link" href={glossaryLinks.tvl}>TVL</a>
								represents
								<a class="body-link" href={glossaryLinks.stablecoin}>stablecoin</a>
								deposits in a protocol’s vaults.
								<a class="body-link" href={glossaryLinks.apy}>APY</a>
								represents the yield of the last thirty days.
							</p>
							<p>
								Risk ratings from
								<a class="risk-rating-link" href={resolve('/vaults/core3-ratings')}>
									<img src={riskRatingProviders.core3.logoUrl} alt="" />
									<span>CORE3</span>
								</a>
								and
								<a class="risk-rating-link" href={resolve('/vaults/xerberus-ratings')}>
									<img src={riskRatingProviders.xerberus.logoUrl} alt="" />
									<span>Xerberus</span>
								</a>
								are provided.
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
							showLabelLogos
							testId="protocol-tvl-pie-chart"
						/>
					</MarketShareWidgetBox>
				</div>
			</VaultGroupIndexHeader>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Protocol"
			includeRisk
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

		.risk-rating-link {
			text-decoration: none;

			span {
				text-decoration: underline;
			}

			img {
				display: inline-block;
				width: 1em;
				height: 1em;
				margin-right: 0.25em;
				object-fit: contain;
				vertical-align: -0.1em;
			}
		}
	}
</style>

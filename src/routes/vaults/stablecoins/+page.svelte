<!--
Vault stablecoins index page.
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
	import {
		getStablecoinDetailsHref,
		getStablecoinLogoUrl,
		isStablecoinDepegged
	} from '$lib/stablecoin-metadata/helpers.js';
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';
	import VaultGroupIndexHeader from '../VaultGroupIndexHeader.svelte';
	import MarketSharePieChart from '../MarketSharePieChart.svelte';
	import MarketShareWidgetBox from '../MarketShareWidgetBox.svelte';
	import StablecoinYieldComparison from './StablecoinYieldComparison.svelte';

	let { data } = $props();
	let { stablecoins, chartStablecoins, yieldComparison, generatedAt, options } = $derived(data);
	let totalTvl = $derived(stablecoins.reduce((total, stablecoin) => total + stablecoin.tvl, 0));
	let totalTvlLabel = $derived(`${formatDollar(totalTvl / 1_000_000_000, 1, 1, { notation: 'standard' })} billion`);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	// search wording: "stablecoin yields", "best stablecoin yield", "stablecoin yield comparison"
	const pageTitle = 'Compare stablecoin yields';
	const heading = 'Stablecoin yields';
	const description =
		'Compare stablecoin yields: DeFi vault APY and TVL for USDC, USDT, USDe and other stablecoins. TVL represents deposits of a stablecoin in vaults. APY represents the yield of the last thirty days.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	title={pageTitle}
	{description}
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

			<VaultGroupIndexHeader>
				<div class="intro-column">
					<HeroBanner>
						{#snippet title()}
							<span>{heading}</span>
						{/snippet}
						{#snippet subtitle()}
							<p>
								<a class="body-link" href={resolve('/glossary/defi')}>DeFi</a>
								<a class="body-link" href={resolve('/glossary/vault')}>vaults</a>
								for different
								<a class="body-link" href={resolve('/glossary/stablecoin')}>stablecoins</a>.
								<a class="body-link" href={resolve('/glossary/total-value-locked-tvl')}>TVL</a>
								represents deposits of a stablecoin in vaults.
								<a class="body-link" href={resolve('/glossary/apy')}>APY</a>
								represents the yield of last thirty days.
							</p>
							<p>{totalTvlLabel} TVL tracked across {stablecoins.length} stablecoins.</p>
						{/snippet}
					</HeroBanner>
				</div>

				<div class="chart-column">
					<MarketShareWidgetBox title="Market share by TVL">
						<MarketSharePieChart
							items={chartStablecoins}
							groupLabel="Stablecoin"
							groupLabelPlural="stablecoins"
							showLabelLogos
							testId="stablecoin-tvl-pie-chart"
						/>
					</MarketShareWidgetBox>
				</div>
			</VaultGroupIndexHeader>
		</div>
	</Section>

	<Section padding="sm">
		<StablecoinYieldComparison rows={yieldComparison} updatedAt={generatedAt} />
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Stablecoin"
			includeFullName
			getLogoHref={getStablecoinLogoUrl}
			getHref={getStablecoinDetailsHref}
			getWarningLabel={(row) =>
				isStablecoinDepegged(row) ? `${row.name} is below 90% of its native peg rate` : undefined}
			rows={stablecoins}
			{...options}
			{onChange}
		/>
	</Section>
</main>

<style>
	.stablecoin-index-page .header-stack {
		display: grid;
		gap: 1rem;
	}
</style>

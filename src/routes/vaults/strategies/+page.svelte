<!--
Vault strategy category index.
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
	import { JsonLd } from 'svelte-meta-tags';
	import MetaTags from '$lib/social-card/SocialCardMetaTags.svelte';

	let { data } = $props();
	let { categories, options } = $derived(data);

	const title = 'Vaults by strategy | Trading Strategy';
	const description =
		'Explore vaults by the underlying trading strategy, including reported TVL, vault count, and 30-day average APY.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	function getHref(slug: string) {
		return resolve(`/vaults/strategies/${slug}`);
	}
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
		mainEntity: { '@type': 'ItemList', numberOfItems: categories.length }
	}}
/>

<main class="category-index-page">
	<Section tag="header">
		<div class="header-stack">
			<VaultListingsSelector />
			<HeroBanner>
				{#snippet title()}
					<span>Vaults by strategy</span>
				{/snippet}
				{#snippet subtitle()}
					<p>Explore vaults by the underlying trading strategy. A vault can have more than one strategy category.</p>
				{/snippet}
			</HeroBanner>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Strategy"
			includeDescription
			hideRankings={options.sort === null || options.sort === 'name' || options.sort === 'full_name'}
			averageApyLabel="Avg. APY (30d)"
			averageApyTooltip="Source-reported average annual percentage yield over the last 30 days."
			rows={categories}
			{...options}
			{onChange}
			{getHref}
		/>
	</Section>
</main>

<style>
	.category-index-page .header-stack {
		display: grid;
		gap: 1rem;
	}
</style>

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

	const title = 'Vault strategy categories | Trading Strategy';
	const description =
		'Explore DeFi vaults by documented investment strategy category, including reported TVL, vault count, and 30-day average APY.';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	function getHref(slug: string) {
		return resolve(`/vaults/categories/${slug}`);
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
					<span>Vault categories</span>
				{/snippet}
				{#snippet subtitle()}
					<p>
						Explore DeFi vaults by their documented investment strategy. A vault can belong to more than one category.
					</p>
				{/snippet}
			</HeroBanner>
		</div>
	</Section>

	<Section padding="sm">
		<VaultGroupTable
			groupLabel="Category"
			includeDescription
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

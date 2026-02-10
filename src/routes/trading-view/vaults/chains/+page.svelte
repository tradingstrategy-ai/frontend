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
	import { getLogoUrl } from '$lib/helpers/assets';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { chains, options } = $derived(data);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	function getHref(slug: string) {
		return resolve(`/trading-view/vaults/chains/${slug}`);
	}

	const title = 'DeFi stablecoin vaults by chain';
	const description = 'Top DeFi vaults, grouped by blockchain';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<main class="chain-index-page">
	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner subtitle="Browse DeFi stablecoin vaults by their blockchain">
			{#snippet title()}
				<span>DeFi vaults by chain</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
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
		:global(.badge) {
			font-size: 0.5em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}
</style>

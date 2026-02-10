<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { MetaTags } from 'svelte-meta-tags';

	let { data } = $props();
	let { stablecoins, options } = $derived(data);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	const title = 'DeFi vault stablecoins | Trading Strategy';
	const description = 'Top DeFi vault stablecoins across all blockchains';
	let pageUrl = $derived(new URL(page.url.pathname, page.url.origin).href);
</script>

<MetaTags
	{title}
	{description}
	canonical={pageUrl}
	openGraph={{ siteName: 'Trading Strategy', url: pageUrl, title, description, type: 'website' }}
	twitter={{ site: '@TradingProtocol', cardType: 'summary', title, description }}
/>

<main class="stablecoin-index-page">
	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner subtitle="Browse supported DeFi vault stablecoins across all blockchains">
			{#snippet title()}
				<span>DeFi vaults by their stablecoin denomination</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="sm">
		<VaultGroupTable groupLabel="Stablecoin" rows={stablecoins} {...options} {onChange} />
	</Section>
</main>

<style>
	.stablecoin-index-page {
		:global(.badge) {
			font-size: 0.5em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}
</style>

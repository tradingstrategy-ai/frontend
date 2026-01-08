<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';

	let { data } = $props();
	let { chains, options } = $derived(data);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};

	function getHref(slug: string) {
		return `/trading-view/${slug}/vaults`;
	}
</script>

<svelte:head>
	<title>DeFi stablecoin vaults by chain</title>
	<meta name="description" content="Top DeFi vaults, grouped by blockchain" />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Top vaults', chains: 'Chains' }} />

<main class="chain-index-page">
	<Section tag="header" --section-padding="0">
		<VaultListingsSelector />
		<HeroBanner subtitle="Browse DeFi vaults grouped by blockchain">
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

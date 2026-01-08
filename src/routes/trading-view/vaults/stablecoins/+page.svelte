<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import { goto } from '$app/navigation';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import VaultGroupTable from '$lib/top-vaults/VaultGroupTable.svelte';
	import VaultListingsSelector from '$lib/top-vaults/VaultListingsSelector.svelte';

	let { data } = $props();
	let { stablecoins, options } = $derived(data);

	const onChange: ComponentProps<typeof VaultGroupTable>['onChange'] = async (params, scrollToTop) => {
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		await goto('?' + new URLSearchParams(params), { noScroll: true });
		scrollToTop();
	};
</script>

<svelte:head>
	<title>DeFi vault stablecoins | Trading Strategy</title>
	<meta name="description" content="Top DeFi vault stablecoins across all blockchains" />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Top vaults', stablecoins: 'Stablecoins' }} --breadcrumb-margin="0" />

<main class="stablecoin-index-page">
	<Section tag="header">
		<VaultListingsSelector />
		<HeroBanner subtitle="Browse supported DeFi vault stablecoins across all blockchains">
			{#snippet title()}
				<span>DeFi vaults by their stablecoin denomiation</span>
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

<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';

	const { data } = $props();
	const { topVaults } = data;
</script>

<svelte:head>
	<title>Top vaults | Trading Strategy</title>
	<meta name="description" content="Browse the highest performing vaults across all supported blockchains." />
</svelte:head>

<Breadcrumbs labels={{ vaults: 'Top Vaults' }} />

<main class="top-vaults ds-3">
	<Section tag="header">
		<HeroBanner subtitle="The best performing DeFi vaults across all chains with minimum $50k USD TVL">
			{#snippet title()}
				<span>Top DeFi Vaults</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<TopVaultsTable {topVaults} />
	</Section>
</main>

<style>
	.top-vaults {
		:global(.badge) {
			font-size: 0.5em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}
</style>

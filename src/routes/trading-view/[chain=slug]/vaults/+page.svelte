<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';

	const { data } = $props();
	const { topVaults, chain } = data;
	const chainName = chain.chain_name;
</script>

<svelte:head>
	<title>{chainName} top vaults | Trading Strategy</title>
	<meta name="description" content="Top vaults on {chainName} ranked by performance." />
</svelte:head>

<Breadcrumbs labels={{ [chain.chain_slug]: chainName, vaults: 'Top Vaults' }} />

<main class="chain-vaults ds-3">
	<Section tag="header">
		<HeroBanner subtitle="The best performing DeFi vaults on {chainName} with minimum $50k USD TVL">
			{#snippet title()}
				<span>Top {chainName} Vaults</span>
				<DataBadge class="badge" status="warning">Beta</DataBadge>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<TopVaultsTable {topVaults} apiChain={chain} />
	</Section>
</main>

<style>
	.chain-vaults {
		:global(.badge) {
			font-size: 0.5em;
			margin-inline: 0.25em;
			transform: translate(0, -0.375em);
		}
	}
</style>

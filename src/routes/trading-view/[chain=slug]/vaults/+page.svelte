<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import DataBadge from '$lib/components/DataBadge.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import TopVaultsTable from '$lib/top-vaults/TopVaultsTable.svelte';

	const { data } = $props();
	const { chain, topVaults } = data;
</script>

<svelte:head>
	<title>{chain.name} top vaults | Trading Strategy</title>
	<meta name="description" content="Top vaults on {chain.name} ranked by performance." />
</svelte:head>

<Breadcrumbs labels={{ [chain.slug]: chain.name, vaults: 'Top Vaults' }} />

<main class="chain-vaults ds-3">
	<Section tag="header">
		<HeroBanner subtitle="The best performing DeFi vaults on {chain.name} with minimum $50k USD TVL">
			{#snippet title()}
				<span>
					<img src={getLogoUrl('blockchain', chain.slug)} alt={chain.name} />
					<span>Top {chain.name} Vaults</span>
					<DataBadge class="badge" status="warning">Beta</DataBadge>
				</span>
			{/snippet}
		</HeroBanner>
	</Section>

	<Section>
		<TopVaultsTable {topVaults} {chain} />
	</Section>
</main>

<style>
	.chain-vaults {
		span {
			display: inline-flex;
			flex-wrap: wrap;
			gap: 0.25em;
			align-items: center;
		}

		img {
			height: 1em;
		}

		:global(.badge) {
			font-size: 0.5em;
		}
	}
</style>

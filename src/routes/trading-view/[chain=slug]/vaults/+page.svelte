<script lang="ts">
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
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
		<HeroBanner
			title="Top {chainName} Vaults"
			subtitle="The best performing DeFi vaults on {chainName} with minimum $50k USD TVL"
		/>
	</Section>

	<Section>
		<TopVaultsTable {topVaults} />
	</Section>
</main>

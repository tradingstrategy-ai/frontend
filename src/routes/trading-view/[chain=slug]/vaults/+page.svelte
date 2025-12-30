<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { chain, topVaults } = data;
</script>

<svelte:head>
	<title>{chain.name} top vaults | Trading Strategy</title>
	<meta name="description" content="Top vaults on {chain.name} ranked by performance." />
</svelte:head>

<TopVaultsPage
	{chain}
	{topVaults}
	breadcrumbs={{ [chain.slug]: chain.name }}
	title="Top {chain.name} Vaults"
	subtitle="The best performing DeFi vaults on {chain.name} with minimum $50k USD TVL"
	tvlThreshold={50000}
	filterTvl={true}
/>

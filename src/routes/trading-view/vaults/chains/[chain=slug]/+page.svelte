<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { chain, chainSlug, chainName, topVaults } = $derived(data);
</script>

<svelte:head>
	<title>{chainName} top vaults</title>
	<meta name="description" content="Top stablecoin vaults on {chainName} blockchain ranked by performance." />
</svelte:head>

<TopVaultsPage
	{chain}
	{topVaults}
	breadcrumbs={{ chains: 'Chains', [chainSlug]: chainName }}
	title="Top {chainName} vaults"
	subtitle="The best performing stablecoin vaults on {chainName} with minimum $50k USD TVL"
	tvlThreshold={50000}
	filterTvl={true}
/>

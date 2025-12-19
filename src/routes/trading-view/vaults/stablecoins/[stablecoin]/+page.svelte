<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { stablecoinSlug, stablecoinName, topVaults } = $derived(data);
</script>

<svelte:head>
	<title>{stablecoinName} top vaults | Trading Strategy</title>
	<meta name="description" content="Top {stablecoinName} DeFi vaults for ranked by performance." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	breadcrumbs={{ stablecoins: 'Stablecoins', [stablecoinSlug]: stablecoinName }}
	title="Top {stablecoinName} vaults"
	subtitle="The best performing {stablecoinName} DeFi vaults with minimum $50k USD TVL"
/>

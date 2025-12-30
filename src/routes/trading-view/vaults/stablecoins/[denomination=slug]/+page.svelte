<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { denominationSlug, denominationName, topVaults } = $derived(data);
</script>

<svelte:head>
	<title>{denominationName} top vaults | Trading Strategy</title>
	<meta name="description" content="Top {denominationName} DeFi vaults for ranked by performance." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	breadcrumbs={{ stablecoins: 'Stablecoins', [denominationSlug]: denominationName }}
	title="Top {denominationName} vaults"
	subtitle="The best performing {denominationName} DeFi vaults with minimum $10k USD TVL"
	tvlThreshold={10000}
	filterTvl={true}
/>

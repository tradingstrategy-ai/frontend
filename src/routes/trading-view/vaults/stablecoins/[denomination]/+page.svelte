<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { denomination, topVaults } = $derived(data);
</script>

<svelte:head>
	<title>{denomination} top vaults | Trading Strategy</title>
	<meta name="description" content="Top {denomination} DeFi vaults for ranked by performance." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	breadcrumbs={{ stablecoins: 'Stablecoins' }}
	title="Top {denomination} vaults"
	subtitle="The best performing {denomination} DeFi vaults with minimum $50k USD TVL"
/>

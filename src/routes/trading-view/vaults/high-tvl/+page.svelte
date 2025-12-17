<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { topVaults } = data;
</script>

<svelte:head>
	<title>High TVL DeFi stablecoin vaults</title>
	<meta name="description" content="The best performing DeFi stablecoin vaults with more than $2M TVL." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	breadcrumbs={{ 'high-tvl': 'TVL > $2M' }}
	title="High TVL stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults with more than $2M TVL"
/>

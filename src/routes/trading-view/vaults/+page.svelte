<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { topVaults } = data;
</script>

<svelte:head>
	<title>Top DeFi stablecoin vaults</title>
	<meta name="description" content="The best DeFi vaults for all blockchains." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	title="Top DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults across multiple blockchains"
/>

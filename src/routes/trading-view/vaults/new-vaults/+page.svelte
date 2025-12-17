<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { topVaults } = data;
</script>

<svelte:head>
	<title>New DeFi stablecoin vaults</title>
	<meta name="description" content="The best performing DeFi stablecoin vaults that started within the last 90 days." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	breadcrumbs={{ 'new-vaults': 'New vaults' }}
	title="New DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults that started within the last 90 days"
/>

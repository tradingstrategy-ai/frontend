<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { topVaults, maxAgeDays } = $derived(data);
</script>

<svelte:head>
	<title>New DeFi stablecoin vaults</title>
	<meta
		name="description"
		content="The best performing DeFi stablecoin vaults that started within the last {maxAgeDays} days."
	/>
</svelte:head>

<TopVaultsPage
	{topVaults}
	title="New DeFi stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults that started within the last {maxAgeDays} days"
	tvlThreshold={10_000}
	filterTvl
/>

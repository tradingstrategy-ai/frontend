<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { formatDollar } from '$lib/helpers/formatters.js';

	let { data } = $props();
	let { topVaults, tvlThreshold } = $derived(data);

	let minTvlString = $derived(formatDollar(tvlThreshold, 0));
</script>

<svelte:head>
	<title>High TVL DeFi stablecoin vaults</title>
	<meta name="description" content="The best performing DeFi stablecoin vaults with more than {minTvlString} TVL." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	{tvlThreshold}
	breadcrumbs={{ 'high-tvl': `TVL > ${minTvlString}` }}
	title="High TVL stablecoin vaults"
	subtitle="The best performing DeFi stablecoin vaults with more than {minTvlString} TVL"
/>

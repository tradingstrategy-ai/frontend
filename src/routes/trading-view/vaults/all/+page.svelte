<!--
All vaults listing including problematic/blacklisted vaults
-->
<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';
	import { formatDollar } from '$lib/helpers/formatters.js';

	let { data } = $props();
	let { topVaults, tvlThreshold } = $derived(data);

	let minTvlString = $derived(formatDollar(tvlThreshold, 0));
</script>

<svelte:head>
	<title>All DeFi stablecoin vaults</title>
	<meta name="description" content="All stablecoin vaults, including ones with stuck funds and oracle problems." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	{tvlThreshold}
	includeBlacklisted
	title="All stablecoin vaults"
	subtitle="All stablecoin vaults, including ones with stuck funds and oracle problems"
/>

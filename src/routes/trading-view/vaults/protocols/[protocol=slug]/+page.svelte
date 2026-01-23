<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { protocolSlug, protocolName, topVaults, protocolMetadata } = $derived(data);
</script>

<svelte:head>
	<title>{protocolName} top vaults</title>
	<meta name="description" content="Top stablecoin vaults on {protocolName}" />
</svelte:head>

<TopVaultsPage {topVaults} {protocolMetadata} title="Top {protocolName} vaults" tvlThreshold={10000} filterTvl={true} />

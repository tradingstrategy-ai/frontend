<script lang="ts">
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	let { data } = $props();
	let { protocolSlug, protocolName, topVaults } = $derived(data);
</script>

<svelte:head>
	<title>{protocolName} top vaults</title>
	<meta name="description" content="Top stablecoin vaults on {protocolName} protocol ranked by performance." />
</svelte:head>

<TopVaultsPage
	{topVaults}
	breadcrumbs={{ protocols: 'Protocols', [protocolSlug]: protocolName }}
	title="Top {protocolName} vaults"
	subtitle="The best performing stablecoin vaults on {protocolName} protocol with minimum $10k USD TVL"
	tvlThreshold={10000}
	filterTvl={true}
/>

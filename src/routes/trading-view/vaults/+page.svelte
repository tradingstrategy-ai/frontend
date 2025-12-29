<script lang="ts">
	import type { TopVaults } from '$lib/top-vaults/schemas.js';
	import TopVaultsPage from '$lib/top-vaults/TopVaultsPage.svelte';

	function filterByMinTvl(topVaults: TopVaults, tvlThreshold: number) {
		const vaults = topVaults.vaults.filter((vault) => {
			return (vault.current_nav ?? 0) >= tvlThreshold;
		});

		return { ...topVaults, vaults };
	}

	let { data } = $props();
	let topVaults = $derived(filterByMinTvl(data.topVaults, 50_000));
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

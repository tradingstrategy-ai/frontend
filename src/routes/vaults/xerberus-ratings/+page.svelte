<!--
Xerberus-rated DeFi stablecoin vaults
-->
<script lang="ts">
	import RiskRatingsPage from '$lib/top-vaults/RiskRatingsPage.svelte';

	let { data } = $props();
</script>

<RiskRatingsPage
	provider="xerberus"
	initialTopVaults={data.initialTopVaults}
	initialHasMore={data.initialHasMore}
	listingSummary={data.listingSummary}
	initialRatingStatistics={data.initialRatingStatistics}
	initialRiskRatingTvlBands={data.initialRiskRatingTvlBands}
/>

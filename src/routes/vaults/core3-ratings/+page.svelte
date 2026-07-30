<!--
CORE3-rated DeFi stablecoin vaults
-->
<script lang="ts">
	import RiskRatingsPage from '$lib/top-vaults/RiskRatingsPage.svelte';

	let { data } = $props();
</script>

<RiskRatingsPage
	provider="core3"
	initialRatingStatistics={data.initialRatingStatistics}
	initialRiskRatingTvlBands={data.initialRiskRatingTvlBands}
/>

<!-- Server-derived vault yield/chain scatter plot. -->
<script lang="ts">
	import ServerYieldScatterPlot from '$lib/scatter-plot/ServerYieldScatterPlot.svelte';
</script>

<ServerYieldScatterPlot
	endpoint="/vaults/yield-chain/chart-data"
	legendTitle="Chain"
	excludedLabel="chain"
	isolateLegend
/>

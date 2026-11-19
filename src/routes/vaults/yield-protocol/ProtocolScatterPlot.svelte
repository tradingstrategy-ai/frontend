<!-- Server-derived vault yield/protocol scatter plot. -->
<script lang="ts">
	import ServerYieldScatterPlot from '$lib/scatter-plot/ServerYieldScatterPlot.svelte';
</script>

<ServerYieldScatterPlot
	endpoint="/vaults/yield-protocol/chart-data.bin"
	legendTitle="Protocol"
	excludedLabel="protocol"
	isolateLegend
/>

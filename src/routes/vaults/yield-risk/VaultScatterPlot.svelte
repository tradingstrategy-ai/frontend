<!-- Server-derived vault yield/risk scatter plot. -->
<script lang="ts">
	import ServerYieldScatterPlot from '$lib/scatter-plot/ServerYieldScatterPlot.svelte';
</script>

<ServerYieldScatterPlot endpoint="/vaults/yield-risk/chart-data" legendTitle="Technical risk" />

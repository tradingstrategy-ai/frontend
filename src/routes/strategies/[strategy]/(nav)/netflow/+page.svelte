<!--

    Page to display netflow, total equity and such.


-->
<script lang="ts">
	import { AlertItem, Button, SummaryBox } from '$lib/components';
	import { onMount } from 'svelte';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import AlertList from '$lib/components/AlertList.svelte';
	import Spinner from 'svelte-spinner';
    import type {WebChartData} from "../../chart";
    import WebChart from "../../WebChart.svelte";

    export let data;
    let netflowChart: WebChartData;
    let tvlChart: WebChartData;

    $: tvlChart = data?.tvlChart;
    $: netflowChart = data?.netflowChart;

</script>

<section class="netflow">
    <WebChart name="Total value locked" webChart={tvlChart} />
    <WebChart name="Netflow" webChart={netflowChart} />
</section>

<style>
</style>

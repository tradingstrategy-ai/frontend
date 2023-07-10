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
    import {formatDaysAgo} from "$lib/helpers/formatters";

    export let data;
    let netflowChart: WebChartData;
    let tvlChart: WebChartData;

    $: tvlChart = data?.tvlChart;
    $: netflowChart = data?.netflowChart;
    $: startedAt = data?.startedAt;

</script>

<section class="netflow">
    <p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong> days.</p>
    <WebChart name="Total value locked" webChart={tvlChart} lineColorName="--hsl-bullish" />
    <WebChart name="Netflow" webChart={netflowChart} charType="bar" />
</section>

<style>
</style>

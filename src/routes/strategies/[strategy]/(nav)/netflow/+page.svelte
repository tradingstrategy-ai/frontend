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

    let data;
    let netflow: WebChartData;
    let tvl: WebChartData;

    $: tvl = data.tvl;
    $: netflow = data.netflow;

</script>

<section class="netflow">
    <WebChart name="Total value locked" webChart={tvl} />
    <WebChart name="Netflow" webChart={netflow} />
</section>

<style>
</style>

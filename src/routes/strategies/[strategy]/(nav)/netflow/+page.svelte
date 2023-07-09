<!--

    Page to display netflow, total equity and such.


-->
<script lang="ts">
	import { AlertItem, Button, SummaryBox } from '$lib/components';
	import { onMount } from 'svelte';
	import type { StrategyRuntimeState } from 'trade-executor-frontend/strategy/runtimeState';
	import AlertList from '$lib/components/AlertList.svelte';
	import Spinner from 'svelte-spinner';
    import type {WebChart} from "../../chart";

    let data;
    let netflow: WebChart;
    let tvl: WebChart;

    $: tvl = data.tvl;
    $: netflow = data.netflow;

</script>

<section class="netflow">
    {JSON.stringify(netflow)}
</section>

<style>
</style>

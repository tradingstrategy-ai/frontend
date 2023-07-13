<!--
	Page to display netflow, total equity and such.
-->
<script lang="ts">
	import WebChart from '../../WebChart.svelte';
	import { formatDaysAgo } from '$lib/helpers/formatters';

	export let data;
	$: ({ tvlChart, netflowChart, startedAt } = data);
</script>

<section class="netflow">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>
	<WebChart name="Total value locked" webChart={tvlChart} />
	<WebChart name="Netflow" webChart={netflowChart} charType="bar" />
</section>

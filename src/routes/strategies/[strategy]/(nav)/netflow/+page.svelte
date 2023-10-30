<!--
	Page to display netflow, total equity and such.
-->
<script lang="ts">
	import WebChart from '../../WebChart.svelte';
	import { StrategyPerformanceChart } from '$lib/chart';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';

	export let data;
	$: ({ tvlChart, netflowChart, startedAt } = data);
</script>

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>
	<StrategyPerformanceChart title="Total value locked" data={tvlChart.data} formatValue={formatDollar}>
		Learn more about
		<a class="body-link" href={tvlChart.help_link}>Total value locked</a>
		metric and how it is calculated.
	</StrategyPerformanceChart>
	<WebChart name="Netflow" webChart={netflowChart} charType="bar" />
</section>

<style lang="postcss">
	.tvl {
		display: grid;
		gap: var(--space-lg);
	}
</style>

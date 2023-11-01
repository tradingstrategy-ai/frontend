<!--
	Page to display netflow, total equity and such.
-->
<script lang="ts">
	import WebChart from '../../WebChart.svelte';
	import { ChartContainer, PerformanceChart, normalzeDataForInterval } from '$lib/chart';
	import { formatDaysAgo, formatDollar } from '$lib/helpers/formatters';

	export let data;
	$: ({ tvlChart, netflowChart, startedAt } = data);
</script>

<section class="tvl">
	<p>Displaying live trading metrics. This strategy has been live <strong>{formatDaysAgo(startedAt)}</strong>.</p>

	<ChartContainer title="Total value locked" let:timeSpan={{ spanDays, interval, periodicity }}>
		<p slot="subtitle">
			Learn more about
			<a class="body-link" href={tvlChart.help_link}>Total value locked</a>
			metric and how it is calculated.
		</p>
		<PerformanceChart
			data={normalzeDataForInterval(tvlChart.data, interval)}
			formatValue={formatDollar}
			{spanDays}
			{periodicity}
		/>
	</ChartContainer>

	<WebChart name="Netflow" webChart={netflowChart} charType="bar" />
</section>

<style lang="postcss">
	.tvl {
		display: grid;
		gap: var(--space-lg);
	}
</style>

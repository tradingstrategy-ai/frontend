<script lang="ts">
	import { utcDay } from 'd3-time';
	import { type RawTick, ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { Alert } from '$lib/components';
	import { parseDate } from '$lib/helpers/date';
	import { formatDollar } from '$lib/helpers/formatters';

	export let tvlData: RawTick[] | undefined;

	const spanDays = getSpanDays(tvlData, 90);

	const chartOptions = {
		controls: { home: null },
		allowScroll: false,
		allowZoom: false
	};

	function getSpanDays(data: RawTick[] | undefined, max: number) {
		const firstDate = parseDate(data?.[0]?.[0]);
		if (!firstDate) return max;
		const age = utcDay.count(firstDate, new Date());
		return Math.min(age, max);
	}
</script>

<div class="strategy-tvl-chart">
	<ChartContainer title="Strategy TVL">
		<span slot="subtitle">
			<a class="body-link" target="_blank" href="/glossary/total-value-locked"> Total value locked </a>
			in live strategies (past {spanDays} days)
		</span>

		{#if tvlData}
			<PerformanceChart
				options={chartOptions}
				data={normalizeDataForInterval(tvlData ?? [], utcDay)}
				formatValue={formatDollar}
				{spanDays}
				periodicity={{ period: 1, interval: 1, timeUnit: 'day' }}
			/>
		{:else}
			<div class="error">
				<Alert size="md" title="Error">Strategy TVL data failed to load.</Alert>
			</div>
		{/if}
	</ChartContainer>
</div>

<style lang="postcss">
	.strategy-tvl-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 2.5;

			@media (--viewport-sm-down) {
				--chart-aspect-ratio: 2.25;
			}

			@media (--viewport-xs) {
				--chart-aspect-ratio: 2;
			}
		}

		.error {
			padding: 1.5rem;

			@media (--viewport-md-down) {
				padding: 1rem;
			}
		}
	}
</style>

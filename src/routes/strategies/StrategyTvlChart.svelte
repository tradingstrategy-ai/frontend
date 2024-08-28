<script lang="ts">
	import { utcDay } from 'd3-time';
	import { type RawTick, ChartContainer, PerformanceChart, normalizeDataForInterval } from '$lib/chart';
	import { Alert } from '$lib/components';
	import { parseDate } from '$lib/helpers/date';
	import { formatDollar } from '$lib/helpers/formatters';

	export let tvlData: RawTick[] | undefined;

	const chartOptions = {
		controls: { home: null },
		allowScroll: false,
		allowZoom: false
	};
</script>

<div class="strategy-tvl-chart">
	<ChartContainer title="Strategy TVL" let:timeSpan={{ spanDays, interval }}>
		<span slot="subtitle">
			<a class="body-link" target="_blank" href="/glossary/total-value-locked">Total value locked</a>
			in live strategies
		</span>

		{#if tvlData}
			<PerformanceChart
				options={chartOptions}
				data={normalizeDataForInterval(tvlData ?? [], interval)}
				formatValue={formatDollar}
				{spanDays}
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

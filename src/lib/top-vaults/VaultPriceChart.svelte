<script lang="ts">
	import type { SeriesCallback } from '$lib/charts/types';
	import { type LineData, type UTCTimestamp, LineSeries } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import Series from '$lib/charts/Series.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { utcDay } from 'd3-time';
	import { formatValue } from '$lib/helpers/formatters';

	interface Props {
		data: LineData<UTCTimestamp>[];
	}

	let { data }: Props = $props();

	let range = $derived.by<[Date, Date]>(() => {
		const end = utcDay.floor(new Date());
		const start = utcDay.offset(end, -90);
		return [start, end];
	});

	const chartOptions = {
		crosshair: { vertLine: { visible: true } },
		handleScroll: false,
		handleScale: false,
		rightPriceScale: { visible: false },
		timeScale: {
			lockVisibleTimeRangeOnResize: true
		}
	};

	const seriesOptions = {
		lineWidth: 2,
		lastValueVisible: false,
		priceLineVisible: false
	};

	const seriesCallback: SeriesCallback = ({ series, colors }) => {
		series.applyOptions({
			color: colors.textExtraLight
		});
	};
</script>

<div class="vault-price-chart">
	<h4>90 day price</h4>
	<TvChart options={chartOptions}>
		<Series type={LineSeries} options={seriesOptions} callback={seriesCallback} {data} />
		<BaselineSeries color="transparent" interval={utcDay} {range} setChartVisibleRange />

		{#snippet tooltip({ point, time }, [item])}
			{#if item}
				<ChartTooltip {point}>
					<div class="tooltip-date"><Timestamp date={time as number} /></div>
					<div class="tooltip-value">{formatValue(item.value, 2)}</div>
				</ChartTooltip>
			{/if}
		{/snippet}
	</TvChart>
</div>

<style>
	.vault-price-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 3;
		}

		display: grid;
		background: var(--c-box-2);
		border-radius: 1.25rem;
		padding-bottom: 1.75rem;

		> :global(*) {
			grid-area: 1 / -1;
		}

		h4 {
			margin: 1.75rem;
		}

		.tooltip-date {
			font: var(--f-ui-sm-medium);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-extra-light);
			margin-bottom: 0.25rem;
		}

		.tooltip-value {
			font: var(--f-ui-lg-medium);
			letter-spacing: var(--ls-ui-lg, normal);
			color: var(--c-text);
			text-align: right;
		}
	}
</style>

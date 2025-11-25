<script lang="ts">
	import type { VaultInfo } from './schemas';
	import type { AreaSeriesPartialOptions } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import { getTimeSeries } from './metrics.remote';
	import { utcDay } from 'd3-time';
	import { formatTokenAmount } from '$lib/helpers/formatters';

	interface Props {
		vault: VaultInfo;
	}

	let { vault }: Props = $props();

	let data = $derived(getTimeSeries(vault.id));

	let range = $derived.by<[Date, Date]>(() => {
		const end = utcDay.floor(new Date());
		const start = utcDay.offset(end, -90);
		return [start, end];
	});

	const chartOptions = {
		crosshair: { vertLine: { visible: true } },
		handleScroll: false,
		handleScale: false,
		timeScale: {
			lockVisibleTimeRangeOnResize: true
		}
	};

	const seriesOptions: AreaSeriesPartialOptions = {
		priceLineVisible: false,
		crosshairMarkerVisible: false
	};
</script>

<div class="vault-price-chart">
	<h4>90 day price</h4>
	<TvChart options={chartOptions} loading={data.loading}>
		<AreaSeries data={data.current ?? []} direction={1} options={seriesOptions} />
		<BaselineSeries color="transparent" interval={utcDay} {range} setChartVisibleRange />

		{#snippet tooltip({ point, time }, [item])}
			{#if item}
				<ChartTooltip {point}>
					<div class="tooltip-date"><Timestamp date={time as number} /></div>
					<div class="tooltip-value">{formatTokenAmount(item.value, 2)} {vault.denomination}</div>
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
		background: var(--c-box-1);
		border: 1px solid var(--c-box-3);
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

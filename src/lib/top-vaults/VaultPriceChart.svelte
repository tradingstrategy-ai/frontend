<script lang="ts">
	import type { VaultInfo } from './schemas';
	import { HistogramSeries } from 'lightweight-charts';
	import TvChart from '$lib/charts/TvChart.svelte';
	import AreaSeries from '$lib/charts/AreaSeries.svelte';
	import Series from '$lib/charts/Series.svelte';
	import BaselineSeries from '$lib/charts/BaselineSeries.svelte';
	import SeriesLabel from '$lib/charts/SeriesLabel.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import { getTimeSeries } from './metrics.remote';
	import { utcDay } from 'd3-time';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import { formatDate } from '$lib/charts/helpers';

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
</script>

<div class="vault-price-chart">
	<TvChart
		loading={data.loading}
		options={{
			crosshair: { vertLine: { visible: true } },
			handleScroll: false,
			handleScale: false,
			localization: { priceFormatter: (v: number) => formatTokenAmount(v, 2) },
			timeScale: { lockVisibleTimeRangeOnResize: true }
		}}
	>
		<AreaSeries
			data={data.current?.price ?? []}
			direction={1}
			options={{
				priceLineVisible: false,
				crosshairMarkerVisible: false
			}}
		>
			<SeriesLabel heading>Price</SeriesLabel>
		</AreaSeries>

		<Series
			type={HistogramSeries}
			data={data.current?.tvl ?? []}
			options={{ priceLineVisible: false, color: 'transparent' }}
			paneIndex={1}
			priceScaleOptions={{ scaleMargins: { top: 0.25, bottom: 0 } }}
			callback={({ series, colors }) => {
				series.getPane().setHeight(150);
				series.applyOptions({ color: colors.box3 });
			}}
		>
			<SeriesLabel heading>TVL</SeriesLabel>
		</Series>

		<BaselineSeries color="transparent" interval={utcDay} {range} setChartVisibleRange />

		{#snippet tooltip({ point, time }, [price, tvl])}
			{#if price || tvl}
				<ChartTooltip {point}>
					<div class="tooltip-date">{formatDate(time as number, '1d')}</div>
					<dl class="tooltip-items">
						<dt>Price:</dt>
						<dd>{formatTokenAmount(price?.value, 2)} {vault.denomination}</dd>
						<dt>TVL:</dt>
						<dd>{formatTokenAmount(tvl?.value, 2)}</dd>
					</dl>
				</ChartTooltip>
			{/if}
		{/snippet}
	</TvChart>
</div>

<style>
	.vault-price-chart {
		:global([data-css-props]) {
			--chart-aspect-ratio: 2;
		}

		.tooltip-date {
			margin-bottom: 0.75rem;
			font: var(--f-ui-sm-bold);
			letter-spacing: var(--ls-ui-sm, normal);
			color: var(--c-text-extra-light);
		}

		.tooltip-items {
			display: grid;
			grid-template-columns: auto auto;
			align-items: end;
			gap: 0.25rem 0.75rem;

			dt {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm, normal);
				color: var(--c-text-extra-light);
				text-transform: uppercase;
			}

			dd {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md, normal);
				color: var(--c-text);
			}
		}
	}
</style>

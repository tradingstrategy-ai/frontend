<script lang="ts">
	import type { ComponentProps } from 'svelte';
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import type { TimeBucket } from '$lib/schemas/utility';
	import type { ApiCandle, TvChartOptions } from './types';
	import type { OptionGroup } from '$lib/helpers/option-group.svelte';
	import { CandleDataFeed, apiCandleToDataItem, tsToUnixTimestamp } from './candle-data-feed.svelte';
	import { type LineSeriesPartialOptions, LineSeries } from 'lightweight-charts';
	import ChartHeader from './ChartHeader.svelte';
	import SegmentedControl from '$lib/components/SegmentedControl.svelte';
	import TvChart from './TvChart.svelte';
	import CandleSeries from './CandleSeries.svelte';
	import Series from './Series.svelte';
	import ChartTooltip from '$lib/charts/ChartTooltip.svelte';
	import { formatDate } from './helpers';
	import { getProfitInfo } from '$lib/components/Profitability.svelte';
	import { relativeReturn } from '$lib/helpers/financial';
	import { formatInterestRate } from '$lib/helpers/formatters';

	interface Props {
		reserve: LendingReserve;
		timeBucket: OptionGroup<TimeBucket>;
		onchange?: ComponentProps<typeof SegmentedControl>['onchange'];
	}

	let { reserve, timeBucket, onchange }: Props = $props();

	let urlParams = $derived({
		chain_slug: reserve.chain_slug,
		protocol_slug: reserve.protocol_slug,
		reserve_slug: reserve.reserve_slug
	});

	let borrowFeed = $derived(
		new CandleDataFeed(
			fetch,
			'lending-reserve/candles',
			timeBucket.selected,
			{ ...urlParams, candle_types: 'variable_borrow_apr' },
			(data) => (data.variable_borrow_apr ?? []).map((c: ApiCandle) => apiCandleToDataItem(c))
		)
	);

	let supplyFeed = $derived(
		new CandleDataFeed(
			fetch,
			'lending-reserve/candles',
			timeBucket.selected,
			{ ...urlParams, candle_types: 'supply_apr' },
			(data) =>
				(data.supply_apr ?? []).map(({ ts, c: value, o: open }: ApiCandle) => ({
					time: tsToUnixTimestamp(ts),
					value,
					customValues: { open }
				}))
		)
	);

	const supplySeriesOptions: LineSeriesPartialOptions = {
		color: 'mediumslateblue',
		lineWidth: 2,
		lastValueVisible: false,
		priceLineVisible: false
	};

	const chartOptions: TvChartOptions = {
		localization: {
			priceFormatter: (n: number) => formatInterestRate(n, 1, 2)
		}
	};
</script>

<div class="reserve-interest-chart">
	<ChartHeader title="Interest rates">
		<SegmentedControl name="timeBucket" options={timeBucket.options} bind:selected={timeBucket.selected} {onchange} />
	</ChartHeader>

	<TvChart grid crosshairs options={chartOptions} loading={borrowFeed.loadingInitialData}>
		<CandleSeries dataFeed={borrowFeed} />
		<Series type={LineSeries} dataFeed={supplyFeed} options={supplySeriesOptions} />

		{#snippet tooltip({ point, time }, [borrow, supply])}
			{@const borrowInfo = getProfitInfo(relativeReturn(borrow?.open, borrow?.close))}
			{@const supplyInfo = getProfitInfo(relativeReturn(supply?.customValues?.open as MaybeNumber, supply?.value))}

			<ChartTooltip {point}>
				<h4>{formatDate(time as number, timeBucket.selected)}</h4>
				<table class="metrics">
					<tbody>
						<tr class={borrowInfo.directionClass}>
							<th>Borrow APR</th>
							<td>{formatInterestRate(borrow?.close)}</td>
						</tr>
						<tr class={supplyInfo.directionClass}>
							<th>Supply APR</th>
							<td>{formatInterestRate(supply?.value)}</td>
						</tr>
					</tbody>
				</table>
			</ChartTooltip>
		{/snippet}
	</TvChart>
</div>

<style>
	.reserve-interest-chart {
		display: grid;

		h4 {
			margin-bottom: 0.5rem;
			font: var(--f-ui-md-medium);
			letter-spacing: var(--ls-ui-md, normal);
			color: var(--c-text-extra-light);
		}

		.metrics {
			width: 100%;
			border-collapse: collapse;
			color: var(--c-text-light);

			tr * {
				padding-block: 0.25rem;
			}

			tr:last-child * {
				padding-bottom: 0;
			}

			th {
				font: var(--f-ui-md-medium);
				letter-spacing: var(--ls-ui-md, normal);
				text-align: left;
			}

			td {
				padding-left: 1rem;
				font: var(--f-ui-md-bold);
				letter-spacing: var(--ls-ui-md, normal);
				text-align: right;
			}
		}
	}
</style>

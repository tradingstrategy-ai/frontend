<script lang="ts" context="module">
	const rateTypes = {
		supply_apr: { label: 'Supply APR', color: 'slateblue' },
		stable_borrow_apr: { label: 'Stable Borrow APR', color: 'darkorange' },
		variable_borrow_apr: { label: 'Variable Borrow APR', color: 'gray' }
	} as const;

	export type RateType = keyof typeof rateTypes;
</script>

<script lang="ts">
	import type { Candle, TimeBucket } from '$lib/chart';
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import { candleToQuote, quoteFeed, timeBucketToPeriodicity, ChartIQ, HudRow, HudMetric } from '$lib/chart';
	import { formatInterestRate } from '$lib/helpers/formatters';

	export let reserve: LendingReserve;
	export let timeBucket: TimeBucket;
	export let primaryRate: RateType;
	export let secondaryRates: RateType[] = [];

	$: ({ chain_slug, protocol_slug, reserve_slug } = reserve);
	$: symbol = `${chain_slug}-${protocol_slug}-${reserve_slug}`.toUpperCase();
	$: periodicity = timeBucketToPeriodicity(timeBucket);

	const feed = quoteFeed('lending-reserve/candles', null, (data: any) => {
		return data[primaryRate].map((candle: Candle, idx: number) => {
			const quote = candleToQuote(candle);
			for (const type in rateTypes) {
				quote[type] = data[type]?.[idx]?.c;
			}
			return quote;
		});
	});

	const options = {
		layout: { crosshair: true },
		controls: { chartControls: null },
		preferences: { labels: false },
		chart: {
			yaxisMarginMultiplier: 1,
			yAxis: {
				drawCurrentPriceLabel: false,
				initialMarginTop: 75,
				decimalPlaces: 2,
				maxDecimalPlaces: 4
			}
		}
	};

	const secondaryRateOptions = {
		loadData: false,
		shareYAxis: true,
		gapDisplayStyle: true,
		tension: 0.25
	};

	function init(chartEngine: any) {
		// HACK to address ChartIQ bug - times in floating x-axis label are off by 3h for 4h timeBucket
		const originalFormatter = chartEngine.chart.xAxis.formatter;
		chartEngine.chart.xAxis.formatter = function (labelDate: Date) {
			const adjustedDate = new Date(labelDate);
			if (timeBucket === '4h') {
				adjustedDate.setUTCHours(adjustedDate.getUTCHours() + 3);
			}
			return originalFormatter(adjustedDate);
		};

		// update the chart - used on both initial load and updates
		function update() {
			// clear and re-add secondary rate series
			Object.values(chartEngine.chart.series).forEach((s) => chartEngine.removeSeries(s));
			secondaryRates.forEach((rate) => {
				const { color } = rateTypes[rate];
				chartEngine.addSeries(rate, { ...secondaryRateOptions, color });
			});

			// pass required data to quoteFeed
			const symbolObject = {
				symbol,
				urlParams: { chain_slug, protocol_slug, reserve_slug, candle_types: 'all', time_bucket: timeBucket }
			};

			// load the chart
			chartEngine.loadChart(symbolObject, { periodicity });
		}

		return { update };
	}
</script>

<ChartIQ {init} {options} {feed} invalidate={[chain_slug, protocol_slug, reserve_slug, periodicity]} let:cursor>
	{#if cursor.data}
		{@const direction = Math.sign(cursor.data.Close - cursor.data.Open)}
		<div class="reserve-interest-rate-hud">
			<HudRow>
				<h3>{rateTypes[primaryRate].label}:</h3>
				<HudMetric label="O" value={formatInterestRate(cursor.data.Open)} {direction} />
				<HudMetric label="H" value={formatInterestRate(cursor.data.High)} {direction} />
				<HudMetric label="L" value={formatInterestRate(cursor.data.Low)} {direction} />
				<HudMetric label="C" value={formatInterestRate(cursor.data.Close)} {direction} />
			</HudRow>
			<HudRow>
				{#each secondaryRates as rate, idx}
					{@const { label, color } = rateTypes[rate]}
					<HudMetric
						--label-color={color}
						class="secondary idx-{idx}"
						{label}
						value={formatInterestRate(cursor.data[rate])}
						{direction}
					/>
				{/each}
			</HudRow>
		</div>
	{/if}
</ChartIQ>

<style lang="postcss">
	.reserve-interest-rate-hud {
		background: hsla(var(--hsl-box), var(--a-box-a));
		display: inline-block;
		padding: var(--space-xs) var(--space-sl);

		h3 {
			margin: 0;
			font-weight: 500;
		}

		:global dl .secondary:not(.idx-0) {
			margin-left: var(--space-md);
		}

		:global .secondary dt {
			font-weight: 500;
			color: var(--label-color);

			&::after {
				content: ':';
			}
		}
	}
</style>

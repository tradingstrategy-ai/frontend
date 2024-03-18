<script lang="ts" context="module">
	const rateTypes = {
		supply_apr: { label: 'Supply APR', color: 'mediumslateblue' },
		stable_borrow_apr: { label: 'Stable Borrow APR', color: 'darkorange' },
		variable_borrow_apr: { label: 'Borrow APR', color: 'gray' }
	} as const;

	export type RateType = keyof typeof rateTypes;
</script>

<script lang="ts">
	import type { Candle, TimeBucket } from '$lib/chart';
	import type { LendingReserve } from '$lib/explorer/lending-reserve-client';
	import { candleToQuote, quoteFeed, timeBucketToPeriodicity, ChartIQ } from '$lib/chart';
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
				priceFormatter: (...args: any[]) => formatInterestRate(args[2], 0, 4)
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

		// returned callback invoked on both initial load and updates
		return () => {
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
		};
	}
</script>

<ChartIQ {init} {options} {feed} invalidate={[chain_slug, protocol_slug, reserve_slug, periodicity]} let:cursor>
	{@const { position, data } = cursor}
	{#if data}
		{@const direction = Math.sign(data.Close - data.Open)}
		<div class="reserve-interest-rate-hud ds-3" style:--x="{position.cx}px">
			<div class="rate-group">
				<span class="label">{rateTypes[primaryRate].label}</span>
				<span class="value" class:bullish={direction > 0} class:bearish={direction < 0}>
					{formatInterestRate(data[primaryRate])}
				</span>
			</div>
			{#each secondaryRates as rate, idx}
				{@const { label, color } = rateTypes[rate]}
				<div class="rate-group" style:--label-color={color}>
					<span class="label">{label}</span>
					<span class="value" style:color>
						{formatInterestRate(data[rate])}
					</span>
				</div>
			{/each}
		</div>
	{/if}
</ChartIQ>

<style lang="postcss">
	.reserve-interest-rate-hud {
		display: inline-grid;
		grid-template-columns: 1fr 1fr;
		border-radius: var(--radius-md);
		margin-top: 0.5rem;
		padding-block: 0.75rem;
		background: var(--c-box-3);

		.rate-group {
			display: grid;
			gap: 0.25rem;
			justify-items: flex-end;
			min-width: 7.25rem;
			padding-inline: 1.125rem;

			& + .rate-group {
				border-left: 1px solid var(--c-text-ultra-light);
			}

			.label {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--ls-ui-sm);
				color: var(--c-text-light);
			}

			.value {
				font: var(--f-ui-lg-medium);
				letter-spacing: var(--ls-ui-lg);
			}
		}
	}
</style>

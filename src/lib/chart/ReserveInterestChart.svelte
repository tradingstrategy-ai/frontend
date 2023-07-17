<script lang="ts">
	import type { Candle, TimeBucket } from '$lib/chart';
	import { candleToQuote, quoteFeed, timeBucketToPeriodicity, ChartIQ, HudRow, HudMetric } from '$lib/chart';
	import { formatInterestRate } from '$lib/helpers/formatters';

	const rateTypes = ['supply_apr', 'stable_borrow_apr', 'variable_borrow_apr'] as const;

	export let reserve: any;
	export let timeBucket: TimeBucket;
	export let rateType: (typeof rateTypes)[number];

	$: ({ chain_slug, protocol_slug, reserve_slug } = reserve);
	$: symbol = `${chain_slug}-${protocol_slug}-${reserve_slug}`.toUpperCase();
	$: periodicity = timeBucketToPeriodicity(timeBucket);

	const feed = quoteFeed('lending-reserve/candles', (data: any) => {
		return data[rateType].map((candle: Candle, idx: number) => {
			const quote = candleToQuote(candle);
			for (const type of rateTypes) {
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

<ChartIQ
	{init}
	{options}
	{feed}
	studies={['Interest Rates']}
	invalidate={[chain_slug, protocol_slug, reserve_slug, periodicity]}
	let:cursor
>
	{#if cursor.data}
		{@const direction = Math.sign(cursor.data.Close - cursor.data.Open)}
		<div class="reserve-interest-rate-hud">
			<HudRow>
				<h3>Variable Borrow APR:</h3>
				<HudMetric label="O" value={formatInterestRate(cursor.data.Open)} {direction} />
				<HudMetric label="H" value={formatInterestRate(cursor.data.High)} {direction} />
				<HudMetric label="L" value={formatInterestRate(cursor.data.Low)} {direction} />
				<HudMetric label="C" value={formatInterestRate(cursor.data.Close)} {direction} />
			</HudRow>
			<HudRow>
				<HudMetric
					class="stable-borrow-apr"
					label="Stable Borrow APR:"
					value={formatInterestRate(cursor.data.stable_borrow_apr)}
					{direction}
				/>
				<HudMetric
					class="supply-apr"
					label="Supply APR:"
					value={formatInterestRate(cursor.data.supply_apr)}
					{direction}
				/>
			</HudRow>
			<HudRow />
		</div>
	{/if}
</ChartIQ>

<style lang="postcss">
	.reserve-interest-rate-hud {
		background: hsla(var(--hsl-box), var(--a-box-a));
		max-width: 27rem;
		padding: var(--space-xs) var(--space-sl);

		& h3 {
			margin: 0;
			font-weight: 500;
		}

		& :global .stable-borrow-apr dt {
			font-weight: 500;
			color: darkorange;
		}

		& :global .supply-apr dt {
			margin-left: var(--space-md);
			font-weight: 500;
			color: slateblue;
		}
	}
</style>

<!--
@component
Render the portfolio performance chart using ChartIQ.
- X-axis: time
- Y-axis: portfolio value
-->
<script lang="ts">
	import { formatPercent } from '$lib/helpers/formatters';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { SegmentedControl, Timestamp, UpDownCell } from '$lib/components';
	import { ChartIQ, Marker } from '$lib/chart';

	export let data: [number, number][];

	let chartWrapper: HTMLElement;

	const timeSpanOptions = {
		'1W': { hours: 1, spanDays: 7, withTime: true },
		'1M': { hours: 4, spanDays: 30, withTime: true },
		'3M': { hours: 24, spanDays: 90, withTime: false }
	} as const;

	let timeSpan: keyof typeof timeSpanOptions = '3M';

	$: ({ hours, spanDays, withTime } = timeSpanOptions[timeSpan]);

	const options = {
		layout: { chartType: 'mountain' },
		controls: { chartControls: null },

		chart: {
			xAxis: { displayGridLines: false },
			yAxis: {
				displayGridLines: false,
				decimalPlaces: 2,
				maxDecimalPlaces: 2
			}
		}
	};

	function init(chartEngine: any) {
		// update chart colors based on change in value (+/-) for visible data set
		chartEngine.append('createDataSegment', () => {
			const dataSegment = chartEngine.getDataSegment();
			const first = chartEngine.getFirstLastDataRecord(dataSegment, 'Close');
			const last = chartEngine.getFirstLastDataRecord(dataSegment, 'Close', 'last');
			const className = determinePriceChangeClass(last?.Close - first?.Close);
			// NOTE: setting class name directly on HTML element rather than declaratively via
			// Svelte template; needed to prevent race condition / ensure colors update correctly.
			if (chartWrapper.className !== className) {
				chartWrapper.className = className;
				chartEngine.clearStyles();
			}
		});

		return {
			update() {
				chartEngine.loadChart('strategy-profitability', {
					periodicity: { period: hours, interval: 60, timeUnit: 'minute' },
					span: { base: 'day', multiplier: spanDays },
					masterData: data.map(([ts, Value]) => ({
						DT: ts * 1000,
						Value
					}))
				});
			}
		};
	}
</script>

<div class="portfolio-performance-chart">
	<header>
		<h2>Total Equity</h2>
		<SegmentedControl options={Object.keys(timeSpanOptions)} bind:selected={timeSpan} />
	</header>
	<p>Cash and market valued tokens in the strategy (USD)</p>
	<div bind:this={chartWrapper}>
		<ChartIQ {init} {options} invalidate={[timeSpan]} let:cursor>
			{@const { position, data } = cursor}
			{#if data}
				<Marker x={position.DateX} y={position.CloseY} size={4.5} />
				<div class="chart-hover-info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
					<UpDownCell value={data.Close - data.iqPrevClose}>
						<Timestamp date={data.originalDate} {withTime} />
						<div class="value">{formatPercent(data.Close, 2)}</div>
					</UpDownCell>
				</div>
			{/if}
		</ChartIQ>
	</div>
</div>

<style lang="postcss">
	.portfolio-performance-chart {
		display: grid;
		gap: var(--space-sm);
		background: hsla(var(--hsl-box), var(--a-box-a));
		border-radius: var(--radius-md);
		padding: var(--space-lg) var(--space-lg);
		--chart-aspect-ratio: 2;

		@media (--viewport-md-down) {
			padding: var(--space-md);
		}

		@media (--viewport-sm-down) {
			--chart-aspect-ratio: 1.75;
		}

		@media (--viewport-xs) {
			--chart-aspect-ratio: 1.25;
		}

		header {
			display: grid;
			grid-template-columns: 1fr auto;
			align-items: center;
		}

		h2 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-heading-sm-medium);
				letter-spacing: var(--f-heading-sm-spacing, normal);
			}
		}

		p {
			color: hsla(var(--hsl-text-extra-light));
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing, normal);

			@media (--viewport-sm-down) {
				font: var(--f-ui-sm-medium);
				letter-spacing: var(--f-ui-sm-spacing, normal);
			}
		}
	}

	.chart-hover-info {
		position: absolute;
		left: var(--x);
		top: var(--y);
		transform: translate(-50%, calc(-100% - var(--space-md)));

		:global(time) {
			color: hsla(var(--hsl-text-extra-light));
		}

		.value {
			font: var(--f-ui-md-medium);
			letter-spacing: var(--f-ui-md-spacing);
		}
	}
</style>

<script lang="ts">
	import type { TimeInterval } from 'd3-time';
	import { type Periodicity, ChartIQ, Marker } from '$lib/chart';
	import { Timestamp, UpDownCell } from '$lib/components';
	import { determinePriceChangeClass } from '$lib/helpers/price';

	export let data: [number, number][];
	export let formatValue: Formatter<number>;
	export let spanDays: number;
	export let periodicity: Periodicity;
	export let interval: TimeInterval;

	type ChartTick = [Date, number];

	let chartWrapper: HTMLElement;

	function getNormalizedIntervalData() {
		return data.reduce((acc: ChartTick[], [ts, value]) => {
			const normalizedDate = interval!.floor(new Date(ts * 1000));
			const lastAddedDate = acc.at(-1)?.[0];
			if (normalizedDate.valueOf() === lastAddedDate?.valueOf()) {
				acc.pop();
			}
			acc.push([normalizedDate, value]);
			return acc;
		}, []);
	}

	const options = {
		layout: { chartType: 'mountain' },
		controls: { chartControls: null },
		dontRoll: true,

		chart: {
			tension: 1,
			xAxis: { displayGridLines: false },
			yAxis: {
				displayGridLines: false,
				priceFormatter: (...args: any[]) => formatValue(args[2], 0)
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
					periodicity,
					span: { base: 'day', multiplier: spanDays },
					masterData: getNormalizedIntervalData().map(([DT, Value]) => ({ DT, Value }))
				});
			}
		};
	}
</script>

<div class="performance-chart" bind:this={chartWrapper}>
	<ChartIQ {init} {options} invalidate={periodicity} let:cursor>
		{@const { position, data } = cursor}
		{#if data}
			<Marker x={position.DateX} y={position.CloseY} size={4.5} />
			<div class="chart-hover-info" style:--x="{position.cx}px" style:--y="{position.CloseY}px">
				<UpDownCell value={data.Close - data.iqPrevClose}>
					<Timestamp date={data.adjustedDate} withTime={periodicity.timeUnit === 'minute'} />
					<div class="value">{formatValue(data.Close, 2)}</div>
				</UpDownCell>
			</div>
		{/if}
	</ChartIQ>
</div>

<style lang="postcss">
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

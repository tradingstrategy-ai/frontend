<script lang="ts">
	import { addUTCDays, floorUTCDate } from '$lib/helpers/date';
	import { determinePriceChangeClass } from '$lib/helpers/price';
	import { ChartIQ } from '$lib/chart';

	type ChartTick = [Date, number | undefined];

	export let data: ChartTick[] = [];
	export let startDate: Date = addUTCDays(floorUTCDate(new Date()), -90);

	let chartWrapper: HTMLElement;

	const profitClass = determinePriceChangeClass(data.at(-1)?.[1]);

	const options = {
		layout: { chartType: 'mountain' },
		allowScroll: false,
		allowZoom: false,
		extendLastTick: true,
		preferences: { whitespace: 0 },
		xaxisHeight: 0,

		chart: {
			tension: 1,
			xAxis: { noDraw: true },
			yAxis: { noDraw: true }
		}
	};

	function init(chartEngine: any) {
		return {
			update() {
				chartEngine.loadChart('strategy-thumbnail', {
					masterData: data.map(([DT, Value]) => ({ DT, Value })),
					range: { dtLeft: startDate, dtRight: data.at(-1)?.[0] }
				});
			}
		};
	}
</script>

<div bind:this={chartWrapper} class="chart-thumbnail ds-3 {profitClass}">
	<ChartIQ {init} {options} />
</div>

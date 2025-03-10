<script lang="ts">
	import type { CandlestickData } from 'lightweight-charts';
	import { createChart, CandlestickSeries } from 'lightweight-charts';

	type Props = {
		candles: CandlestickData[];
	};

	let { candles }: Props = $props();

	function initChart(node: HTMLElement) {
		const chart = createChart(node);

		const candlestickSeries = chart.addSeries(CandlestickSeries, {
			upColor: '#26a69a',
			downColor: '#ef5350',
			wickUpColor: '#26a69a',
			wickDownColor: '#ef5350',
			borderVisible: false
		});

		candlestickSeries.setData(candles);

		chart.timeScale().fitContent();
	}
</script>

<div class="chart-container" use:initChart></div>

<style>
	.chart-container {
		height: 500px;
	}
</style>

<script lang="ts">
	import type { CandlestickData } from 'lightweight-charts';
	import { createChart, CandlestickSeries } from 'lightweight-charts';
	import { getCssColors } from '$lib/helpers/style';

	type Props = {
		candles: CandlestickData[];
	};

	let { candles }: Props = $props();

	function initChart(node: HTMLElement) {
		const c = getCssColors(['text', 'text-extra-light', 'text-ultra-light', 'bullish', 'bearish', 'box-3']);

		console.log(c);

		const chart = createChart(node, {
			layout: {
				background: { color: 'transparent' },
				textColor: c.text,
				fontFamily: '"Neue Haas Grotesk Text", system-ui, sans-serif',
				fontSize: 14
			},
			grid: {
				vertLines: { color: c['box-3'] },
				horzLines: { color: c['box-3'] }
			},
			crosshair: {
				vertLine: {
					color: c['text-extra-light'],
					// TODO: use non-alpha variant of box-3
					labelBackgroundColor: c['text-ultra-light']
				},
				horzLine: {
					color: c['text-extra-light'],
					// TODO: use non-alpha variant of box-3
					labelBackgroundColor: c['text-ultra-light']
				}
			}
		});

		const candlestickSeries = chart.addSeries(CandlestickSeries, {
			upColor: c.bullish,
			downColor: c.bearish,
			wickUpColor: c.bullish,
			wickDownColor: c.bearish,
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

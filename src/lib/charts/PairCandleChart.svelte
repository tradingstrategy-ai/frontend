<script lang="ts">
	import type { CandlestickData } from 'lightweight-charts';
	import { createChart, CandlestickSeries } from 'lightweight-charts';
	import { type CandleParams, fetchCandles } from './client';
	import { getCssColors } from '$lib/helpers/style';

	type Props = {
		candles: CandlestickData[];
		candleParams: CandleParams;
	};

	let { candles, candleParams }: Props = $props();

	let loading = $state(false);

	function initChart(node: HTMLElement) {
		const c = getCssColors(['text', 'text-extra-light', 'text-ultra-light', 'bullish', 'bearish', 'box-3']);

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

		const candleSeries = chart.addSeries(CandlestickSeries, {
			upColor: c.bullish,
			downColor: c.bearish,
			wickUpColor: c.bullish,
			wickDownColor: c.bearish,
			borderVisible: false
		});

		candleSeries.setData(candles);

		chart.timeScale().setVisibleLogicalRange({ from: candles.length - 181, to: candles.length - 1 });

		chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
			if (loading) return;

			const { from, to } = logicalRange!;

			if (from < 50) {
				loading = true;
				const ticksVisible = Math.round(to - from) + 1;
				const data = candleSeries.data();
				fetchCandles(data[0].time as number, ticksVisible * 2, candleParams).then((candles) => {
					candleSeries.setData([...candles, ...data]);
					loading = false;
				});
			}
		});
	}
</script>

<div class="chart-container" use:initChart></div>

<style>
	.chart-container {
		height: 500px;
	}
</style>

<script lang="ts">
	import type { CandlestickData } from 'lightweight-charts';
	import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
	import { type CandleParams, fetchCandles, getVolumeData } from './client';
	import { getCssColors } from '$lib/helpers/style';

	type Props = {
		candles: CandlestickData[];
		candleParams: CandleParams;
	};

	let { candles, candleParams }: Props = $props();

	let loading = $state(false);

	function handleWheel(event: WheelEvent) {
		const isVertical = Math.abs(event.deltaY) > Math.abs(event.deltaX);
		const modifierPressed = event.ctrlKey || event.altKey || event.metaKey;
		// disabling for now since this page doesn't require scrolling
		// if (isVertical && !modifierPressed) event.stopPropagation();
	}

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

		const volumeSeries = chart.addSeries(HistogramSeries, {
			priceFormat: {
				type: 'volume'
			},
			priceScaleId: '',
			lastValueVisible: false
		});

		volumeSeries.priceScale().applyOptions({
			scaleMargins: { top: 0.7, bottom: 0 }
		});

		const volumeColors = {
			bullish: c.bullish!.replace(')', ', 0.3)'),
			bearish: c.bearish!.replace(')', ', 0.3)')
		};

		candleSeries.setData(candles);
		volumeSeries.setData(getVolumeData(candles, volumeColors));

		chart.timeScale().setVisibleLogicalRange({ from: candles.length - 181, to: candles.length - 1 });

		chart.timeScale().subscribeVisibleLogicalRangeChange((logicalRange) => {
			if (loading) return;

			const { from, to } = logicalRange!;

			if (from < 50) {
				loading = true;
				const ticksVisible = Math.round(to - from) + 1;
				const data = candleSeries.data() as CandlestickData[];
				fetchCandles(data[0].time as number, ticksVisible * 2, candleParams).then((candles) => {
					const newData = [...candles, ...data];
					candleSeries.setData(newData);
					volumeSeries.setData(getVolumeData(newData, volumeColors));
					loading = false;
				});
			}
		});
	}
</script>

<div class="chart-container" use:initChart onwheelcapture={handleWheel}></div>

<style>
	.chart-container {
		height: 600px;
	}
</style>

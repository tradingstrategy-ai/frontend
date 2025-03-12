<script lang="ts">
	import type { CandlestickData } from 'lightweight-charts';
	import { createChart, CandlestickSeries, HistogramSeries } from 'lightweight-charts';
	import { type CandleParams, fetchCandles, getVolumeData } from './client';
	import { getCssColors } from '$lib/helpers/style';
	import { formatTokenAmount } from '$lib/helpers/formatters';
	import Profitability from '$lib/components/Profitability.svelte';

	type Props = {
		candles: CandlestickData[];
		candleParams: CandleParams;
	};

	let { candles, candleParams }: Props = $props();

	let loading = $state(false);

	let showTooltip = $state(false);
	let tooltipX = $state(0);
	let tooltipY = $state(0);
	let tooltipCandle: CandlestickData | undefined = $state();

	const formatter = new Intl.DateTimeFormat('en-GB', {
		timeZone: 'UTC',
		year: '2-digit',
		month: 'short',
		day: '2-digit'
	});

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

		// TODO: should we unsubscribe?
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

		// TODO: should we unsubscribe?
		chart.subscribeCrosshairMove((param) => {
			showTooltip = Boolean(param.point);
			if (param.point) {
				tooltipX = param.point.x;
				tooltipY = param.point.y;
			}

			tooltipCandle = param.seriesData.get(candleSeries) as CandlestickData;
		});
	}
</script>

<div class="chart-container" use:initChart onwheelcapture={handleWheel}>
	{#if showTooltip && tooltipCandle}
		<div class="tooltip" style:--x="{tooltipX}px" style:--y="{tooltipY}px">
			<Profitability of={tooltipCandle.close - tooltipCandle.open}>
				{#snippet children(profitInfo)}
					<header>
						<h3>{formatter.format(new Date((tooltipCandle!.time as number) * 1000))}</h3>
						{profitInfo}
					</header>
					<div class="metrics">
						<div>
							<span>Open:</span>
							<span>{formatTokenAmount(tooltipCandle.open, 3)}</span>
						</div>
						<div>
							<span>High:</span>
							<span>{formatTokenAmount(tooltipCandle.high, 3)}</span>
						</div>
						<div>
							<span>Low:</span>
							<span>{formatTokenAmount(tooltipCandle.low, 3)}</span>
						</div>
						<div>
							<span>Close:</span>
							<span>{formatTokenAmount(tooltipCandle.close, 3)}</span>
						</div>
					</div>
				{/snippet}
			</Profitability>
		</div>
	{/if}
</div>

<style>
	.chart-container {
		position: relative;
		height: 600px;

		> * {
			grid-area: 1 / -1;
		}

		.tooltip {
			position: absolute;
			display: grid;
			margin-left: 0.75rem;
			background: color-mix(in srgb, var(--c-text-inverted), transparent 15%);
			z-index: 2;

			top: var(--y);
			left: var(--x);

			:global(.profitability) {
				display: block;
				min-width: 12rem;
				padding: 1rem;
				box-shadow: var(--shadow-3);
			}

			header {
				display: grid;
				grid-template-columns: 1fr auto;
				gap: 1rem;
				align-content: center;
				margin-bottom: 1rem;
				font: var(--f-ui-md-medium);
			}

			h3 {
				margin-bottom: 0;
			}

			.metrics {
				display: grid;
				gap: 0.5rem;
				font: var(--f-ui-md-roman);
				color: var(--c-text);

				> div {
					display: grid;
					grid-template-columns: 1fr auto;

					> span:last-child {
						text-align: right;
					}
				}
			}
		}
	}
</style>

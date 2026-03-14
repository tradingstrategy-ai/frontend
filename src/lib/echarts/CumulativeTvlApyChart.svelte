<!--
@component
Shared ECharts renderer for the cumulative TVL / APY chart. Accepts prepared
points and display presets so both the homepage widget and standalone page can
reuse the same rendering core.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import {
		BENCHMARK_HIT_SYMBOL_SIZE,
		BENCHMARK_LINE_OPACITY,
		BENCHMARK_ORANGE,
		type BenchmarkPoint,
		type BenchmarkUrls,
		buildAxisBounds,
		buildBenchmarkPoints,
		escapeHtml,
		formatAxisPercent,
		formatRate,
		formatUsd,
		MAX_X_AXIS_RETURN,
		MIN_APY_CHART_VALUE,
		renderTooltipLogo,
		THEME_RED_HOVER,
		type VaultChartPoint,
		Y_AXIS_TOP_PADDING_RATIO
	} from './cumulative-tvl-apy';
	import { type EChartsStatic, loadECharts } from './runtime';
	import { onMount, tick } from 'svelte';

	interface GridPadding {
		top: number;
		right: number;
		bottom: number;
		left: number;
	}

	interface Props {
		points: VaultChartPoint[];
		savingsRate: number | null;
		treasuryRate: number | null;
		benchmarkUrls: BenchmarkUrls;
		logAxes?: boolean;
		linearXAxisCap?: number;
		maxXAxisReturn?: number;
		minApyChartValue?: number;
		yAxisTopPaddingRatio?: number;
		returnsAxisLabel?: string;
		returnsTooltipLabel?: string;
		yAxisLabel?: string;
		emptyMessage?: string;
		showTooltipLogos?: boolean;
		showAxisNamesOnMobile?: boolean;
		chartHeightDesktop?: number;
		chartHeightMobile?: number;
		axisTitleFontSize?: number;
		axisLabelFontSize?: number;
		tooltipFontSize?: number;
		gridDesktop?: GridPadding;
		gridMobile?: GridPadding;
		showVaultSymbols?: boolean;
		vaultSymbolSize?: number;
		invisibleVaultHoverSymbolSize?: number;
		enhanceGlassLines?: boolean;
		variant?: 'glass' | 'plain';
		maxWidth?: string;
		className?: string;
	}

	let {
		points,
		savingsRate,
		treasuryRate,
		benchmarkUrls,
		logAxes = true,
		linearXAxisCap = 15,
		maxXAxisReturn = MAX_X_AXIS_RETURN,
		minApyChartValue = MIN_APY_CHART_VALUE,
		yAxisTopPaddingRatio = Y_AXIS_TOP_PADDING_RATIO,
		returnsAxisLabel = 'Returns (annualised)',
		returnsTooltipLabel = 'Returns annualised',
		yAxisLabel = 'TVL',
		emptyMessage = 'No vault data available.',
		showTooltipLogos = true,
		showAxisNamesOnMobile = false,
		chartHeightDesktop = 500,
		chartHeightMobile = 400,
		axisTitleFontSize = 13,
		axisLabelFontSize = 11,
		tooltipFontSize = 13,
		gridDesktop = { top: 64, right: 68, bottom: 64, left: 68 },
		gridMobile = { top: 46, right: 48, bottom: 48, left: 48 },
		showVaultSymbols = true,
		vaultSymbolSize = 8,
		invisibleVaultHoverSymbolSize = 0,
		enhanceGlassLines = false,
		variant = 'glass',
		maxWidth = '960px',
		className = ''
	}: Props = $props();

	const axisFontStack = chartFontFamily;

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chartInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let resizeObserver = $state<ResizeObserver | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let runtimeReady = $state(false);

	function buildVaultTooltipMeta(point: VaultChartPoint): string {
		const chainLogo = showTooltipLogos ? renderTooltipLogo(point.chainLogoUrl, `${point.chain} logo`) : '';
		const protocolLogo = showTooltipLogos ? renderTooltipLogo(point.protocolLogoUrl, `${point.protocol} logo`) : '';
		const chainLabel = chainLogo
			? `<span style="display: inline-flex; align-items: center; gap: 0.45rem; vertical-align: middle;">${chainLogo}<span>${escapeHtml(point.chain)}</span></span>`
			: `<span>${escapeHtml(point.chain)}</span>`;
		const protocolLabel = protocolLogo
			? `<span style="display: inline-flex; align-items: center; gap: 0.45rem; vertical-align: middle;">${protocolLogo}<span>${escapeHtml(point.protocol)}</span></span>`
			: `<span>${escapeHtml(point.protocol)}</span>`;

		return `<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">${chainLabel}<span aria-hidden="true">·</span>${protocolLabel}</div>`;
	}

	function buildVaultTooltip(point: VaultChartPoint): string {
		return [
			`<div class="tooltip-title" style="margin-bottom: 0.35rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1.05rem; font-weight: 700; line-height: 1.35;">${escapeHtml(point.name)}</div>`,
			buildVaultTooltipMeta(point),
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};"><strong>${escapeHtml(returnsTooltipLabel)}:</strong> ${formatRate(point.realApy)}</div>`,
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};"><strong>Vault TVL:</strong> ${formatUsd(point.individualTvl)}</div>`,
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};"><strong>TVL earning less than this:</strong> ${point.totalTvl > 0 ? ((point.tvlLess / point.totalTvl) * 100).toFixed(1) : '0.0'}% (${formatUsd(point.tvlLess)})</div>`,
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};"><strong>TVL earning better than this:</strong> ${point.totalTvl > 0 ? ((point.tvlBetter / point.totalTvl) * 100).toFixed(1) : '0.0'}% (${formatUsd(point.tvlBetter)})</div>`,
			`<div class="tooltip-hint" style="margin-top: 0.55rem; color: #f8fafc; font-family: ${chartFontFamily};"><span style="text-decoration: underline;">Click to open vault details</span></div>`
		].join('');
	}

	function buildBenchmarkTooltip(point: BenchmarkPoint): string {
		return [
			`<div class="tooltip-title" style="margin-bottom: 0.35rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1.05rem; font-weight: 700; line-height: 1.35;">${escapeHtml(point.label)} (${formatRate(point.rate, point.benchmarkKind === 'savings' ? 2 : 1)})</div>`,
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};">${escapeHtml(point.description)}</div>`,
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};"><strong>Earning better:</strong> ${formatUsd(point.betterTvl)} (${point.pctBetter}%)</div>`,
			`<div class="tooltip-row" style="color: #d5deea; font-family: ${chartFontFamily};"><strong>Earning less:</strong> ${formatUsd(point.worseTvl)} (${point.pctWorse}%)</div>`,
			`<div class="tooltip-hint" style="margin-top: 0.55rem; color: #f8fafc; font-family: ${chartFontFamily};"><span style="text-decoration: underline;">Click to open glossary entry</span></div>`
		].join('');
	}

	function buildBenchmarkSeries(pointType: 'treasury' | 'savings', benchmarkPoints: BenchmarkPoint[]) {
		return {
			name: benchmarkPoints[0]?.label ?? pointType,
			type: 'line',
			silent: false,
			showSymbol: true,
			symbol: 'circle',
			symbolSize: BENCHMARK_HIT_SYMBOL_SIZE,
			lineStyle: {
				color: BENCHMARK_ORANGE,
				width: 5,
				opacity: BENCHMARK_LINE_OPACITY,
				type: 'solid'
			},
			itemStyle: {
				color: BENCHMARK_ORANGE,
				opacity: 0
			},
			tooltip: { trigger: 'item' },
			emphasis: {
				focus: 'none',
				lineStyle: {
					color: THEME_RED_HOVER,
					width: 5,
					opacity: BENCHMARK_LINE_OPACITY,
					type: 'solid'
				},
				itemStyle: {
					color: THEME_RED_HOVER,
					opacity: 1
				}
			},
			blur: {
				lineStyle: {
					color: BENCHMARK_ORANGE,
					width: 5,
					opacity: BENCHMARK_LINE_OPACITY,
					type: 'solid'
				}
			},
			z: 5,
			data: benchmarkPoints
		};
	}

	function destroyChart() {
		resizeObserver?.disconnect();
		resizeObserver = null;

		chartInstance?.off('click');
		chartInstance?.dispose();
		chartInstance = null;
	}

	function attachResizeHandling() {
		resizeObserver?.disconnect();
		if (!chartContainer || !chartInstance) return;

		resizeObserver = new ResizeObserver(() => chartInstance?.resize());
		resizeObserver.observe(chartContainer);
	}

	async function renderChart() {
		if (!chartContainer || !echartsApi) return;

		if (points.length === 0) {
			error = emptyMessage;
			loading = false;
			destroyChart();
			return;
		}

		const bounds = buildAxisBounds(
			points,
			{ treasuryRate, savingsRate },
			{
				logAxes,
				minApyChartValue,
				maxXAxisReturn,
				yAxisTopPaddingRatio,
				linearXAxisCap
			}
		);

		const existingInstance = echartsApi.getInstanceByDom(chartContainer);
		existingInstance?.dispose();
		destroyChart();

		const isMobile = window.innerWidth <= 768;
		const isSinglePoint = points.length === 1;
		const grid = isMobile ? gridMobile : gridDesktop;
		const axisNameVisible = !isMobile || showAxisNamesOnMobile;
		const computedStyles = getComputedStyle(document.documentElement);
		const themeSuccessGreen = computedStyles.getPropertyValue('--c-success').trim() || 'hsl(149 64% 44%)';
		const themeBullishGreen = computedStyles.getPropertyValue('--c-bullish').trim() || themeSuccessGreen;
		const glassLineGradient = enhanceGlassLines
			? new echartsApi.graphic.LinearGradient(0, 0, 1, 0, [
					{ offset: 0, color: themeBullishGreen },
					{ offset: 0.45, color: themeSuccessGreen },
					{ offset: 1, color: themeSuccessGreen }
				])
			: '#22c55e';
		const glassAreaGradient = enhanceGlassLines
			? new echartsApi.graphic.LinearGradient(0, 0, 0, 1, [
					{ offset: 0, color: 'rgba(186, 255, 230, 0.22)' },
					{ offset: 0.5, color: 'rgba(74, 222, 128, 0.11)' },
					{ offset: 1, color: 'rgba(22, 163, 74, 0.02)' }
				])
			: {
					type: 'linear',
					x: 0,
					y: 0,
					x2: 0,
					y2: 1,
					colorStops: [
						{ offset: 0, color: 'rgba(74, 222, 128, 0.34)' },
						{ offset: 0.45, color: 'rgba(34, 197, 94, 0.18)' },
						{ offset: 1, color: 'rgba(22, 163, 74, 0.03)' }
					]
				};
		const benchmarkSeries = [
			...(treasuryRate != null
				? [
						buildBenchmarkSeries(
							'treasury',
							buildBenchmarkPoints('treasury', treasuryRate, points, bounds, logAxes, benchmarkUrls)
						)
					]
				: []),
			...(savingsRate != null
				? [
						buildBenchmarkSeries(
							'savings',
							buildBenchmarkPoints('savings', savingsRate, points, bounds, logAxes, benchmarkUrls)
						)
					]
				: [])
		];
		const cumulativeLineSeries = {
			name: 'Cumulative TVL',
			type: 'line',
			smooth: false,
			showSymbol: isSinglePoint || showVaultSymbols,
			symbol: 'circle',
			symbolSize: isSinglePoint ? 48 : vaultSymbolSize,
			lineStyle: {
				color: glassLineGradient,
				width: isSinglePoint ? 0 : enhanceGlassLines ? 3.5 : 3,
				opacity: isSinglePoint ? 0 : 1,
				shadowBlur: enhanceGlassLines ? 18 : 0,
				shadowColor: enhanceGlassLines ? themeSuccessGreen : 'transparent'
			},
			itemStyle: {
				color: enhanceGlassLines ? themeSuccessGreen : '#22c55e',
				opacity: enhanceGlassLines ? 0.34 : 0.5
			},
			areaStyle: isSinglePoint
				? undefined
				: {
						color: glassAreaGradient
					},
			emphasis: {
				focus: 'none',
				scale: isSinglePoint ? 1.4 : 4,
				lineStyle: {
					color: glassLineGradient,
					shadowBlur: enhanceGlassLines ? 24 : 0,
					shadowColor: enhanceGlassLines ? themeBullishGreen : 'transparent'
				},
				itemStyle: { color: THEME_RED_HOVER, opacity: 0.5 }
			},
			z: 4,
			data: points
		};
		const cumulativeGlowSeries =
			enhanceGlassLines && !isSinglePoint
				? [
						{
							name: 'Cumulative TVL glow',
							type: 'line',
							smooth: false,
							silent: true,
							showSymbol: false,
							lineStyle: {
								color: themeBullishGreen,
								width: 11,
								opacity: 0.18,
								shadowBlur: 26,
								shadowColor: themeSuccessGreen
							},
							tooltip: { show: false },
							animation: false,
							z: 3,
							data: points
						}
					]
				: [];
		const invisibleHoverSeries =
			!showVaultSymbols && invisibleVaultHoverSymbolSize > 0
				? [
						{
							name: 'Cumulative TVL hover targets',
							type: 'scatter',
							symbol: 'circle',
							symbolSize: invisibleVaultHoverSymbolSize,
							itemStyle: {
								color: 'rgba(255,255,255,0)',
								opacity: 0
							},
							emphasis: {
								scale: false,
								itemStyle: {
									color: 'rgba(255,255,255,0)',
									opacity: 0
								}
							},
							z: 6,
							data: points
						}
					]
				: [];

		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 450,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				show: true,
				top: grid.top,
				right: grid.right,
				bottom: grid.bottom,
				left: grid.left,
				borderColor: '#64748b',
				borderWidth: 1,
				containLabel: true
			},
			tooltip: {
				trigger: 'item',
				appendToBody: true,
				backgroundColor: '#111827',
				borderColor: '#1f2937',
				borderWidth: 1,
				padding: 12,
				textStyle: {
					color: '#f8fafc',
					fontFamily: chartFontFamily,
					fontSize: tooltipFontSize,
					lineHeight: 20
				},
				formatter: (params: { data?: VaultChartPoint | BenchmarkPoint }) => {
					const point = params.data;
					if (!point) return '';
					return 'benchmarkKind' in point ? buildBenchmarkTooltip(point) : buildVaultTooltip(point);
				}
			},
			xAxis: {
				type: logAxes ? 'log' : 'value',
				name: axisNameVisible ? returnsAxisLabel : '',
				nameLocation: 'middle',
				nameGap: 40,
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: axisFontStack,
					fontSize: axisTitleFontSize,
					fontWeight: 600,
					align: 'center'
				},
				inverse: true,
				min: bounds.xAxisMin,
				max: bounds.xAxisMax,
				axisLine: { lineStyle: { color: '#64748b' } },
				axisLabel: {
					color: '#e2e8f0',
					fontFamily: axisFontStack,
					fontSize: axisLabelFontSize,
					fontWeight: 600,
					align: 'left',
					margin: 10,
					formatter: (value: number) => {
						if (logAxes && value > bounds.xAxisMax * 1.0000001) return '';
						return formatAxisPercent(value);
					}
				},
				splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.18)' } }
			},
			yAxis: {
				type: logAxes ? 'log' : 'value',
				name: axisNameVisible ? yAxisLabel : '',
				nameLocation: 'end',
				nameRotate: 0,
				nameGap: 16,
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: axisFontStack,
					fontSize: axisTitleFontSize,
					fontWeight: 600
				},
				position: 'right',
				min: bounds.yAxisMin,
				max: bounds.yAxisMax,
				axisLine: { lineStyle: { color: '#64748b' } },
				axisLabel: {
					color: '#e2e8f0',
					fontFamily: axisFontStack,
					fontSize: axisLabelFontSize,
					fontWeight: 600,
					formatter: (value: number) => formatUsd(value)
				},
				splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.18)' } }
			},
			series: [...cumulativeGlowSeries, cumulativeLineSeries, ...invisibleHoverSeries, ...benchmarkSeries]
		});

		chartInstance.on('click', (params) => {
			const targetUrl = params.data?.url;
			if (targetUrl) goto(targetUrl);
		});

		attachResizeHandling();
		error = null;
		loading = false;
	}

	onMount(() => {
		let disposed = false;

		const handleWindowResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleWindowResize);

		(async () => {
			try {
				echartsApi = await loadECharts();
				if (disposed) return;

				runtimeReady = true;
				await tick();
				if (disposed) return;

				await renderChart();
			} catch (loadError) {
				if (disposed) return;

				error = loadError instanceof Error ? loadError.message : 'Failed to initialise chart.';
				loading = false;
				destroyChart();
			}
		})();

		return () => {
			disposed = true;
			window.removeEventListener('resize', handleWindowResize);
			destroyChart();
		};
	});

	$effect(() => {
		points;
		logAxes;
		savingsRate;
		treasuryRate;
		returnsAxisLabel;
		returnsTooltipLabel;
		if (!runtimeReady || !echartsApi || !chartContainer) return;

		let cancelled = false;
		void tick().then(async () => {
			if (cancelled) return;
			await renderChart();
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<div
	class={`echarts-cumulative-tvl-apy-chart ${variant === 'glass' ? 'glass-frame' : 'plain-frame'} ${className}`}
	style={`--chart-max-width: ${maxWidth}; --chart-height-desktop: ${chartHeightDesktop}px; --chart-height-mobile: ${chartHeightMobile}px;`}
>
	{#if loading}
		<div class="loading-overlay">
			<Spinner size="48" />
		</div>
	{/if}
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<div bind:this={chartContainer} class="chart" class:obscured={loading || !!error}></div>
</div>

<style>
	.echarts-cumulative-tvl-apy-chart {
		position: relative;
		min-height: 400px;
		width: 100%;

		&.glass-frame {
			max-width: var(--chart-max-width);
			margin-inline: auto;
			padding: clamp(0.75rem, 1.8vw, 1rem);
			border-radius: var(--radius-lg);
			overflow: hidden;
			isolation: isolate;
			background:
				linear-gradient(
					180deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 16%) 0%,
					color-mix(in srgb, var(--c-box-1), transparent 6%) 42%,
					color-mix(in srgb, var(--c-text-inverted), transparent 10%) 100%
				),
				radial-gradient(circle at 14% 10%, color-mix(in srgb, var(--c-bullish), transparent 89%) 0%, transparent 34%),
				radial-gradient(
					circle at top right,
					color-mix(in srgb, var(--c-text-light), transparent 96%) 0%,
					transparent 28%
				),
				linear-gradient(135deg, color-mix(in srgb, var(--c-text-light), transparent 98%), transparent 52%),
				color-mix(in srgb, var(--c-text-inverted), var(--c-box-1) 22%);
			backdrop-filter: blur(0.8rem) saturate(1.08);
			box-shadow:
				0 1.5rem 3.5rem color-mix(in srgb, var(--c-text-inverted), transparent 72%),
				0 0.5rem 1.5rem color-mix(in srgb, var(--c-bullish), transparent 96%),
				inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 78%);

			&::before,
			&::after {
				content: '';
				position: absolute;
				inset: 0;
				pointer-events: none;
				border-radius: inherit;
			}

			&::before {
				background: radial-gradient(
					circle at top,
					color-mix(in srgb, var(--c-text-light), transparent 88%) 0%,
					transparent 50%
				);
				opacity: 0.7;
			}

			&::after {
				background: linear-gradient(
					180deg,
					color-mix(in srgb, var(--c-text-inverted), transparent 92%) 0%,
					transparent 24%,
					color-mix(in srgb, var(--c-text-inverted), transparent 88%) 100%
				);
				opacity: 0.9;
			}
		}
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
		background: linear-gradient(
			180deg,
			color-mix(in srgb, var(--c-box-1), transparent 2%),
			color-mix(in srgb, var(--c-box-1), transparent 16%)
		);
	}

	.chart {
		width: 100%;
		height: var(--chart-height-desktop);
		position: relative;
		z-index: 0;

		@media (--viewport-md-down) {
			height: var(--chart-height-mobile);
		}

		&.obscured {
			visibility: hidden;
		}
	}

	.error {
		text-align: center;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
	}
</style>

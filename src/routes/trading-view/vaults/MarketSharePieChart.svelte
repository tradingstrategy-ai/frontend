<script lang="ts">
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';
	import { escapeHtml, renderTooltipLogo } from '$lib/echarts/cumulative-tvl-apy';
	import { type EChartsStatic, loadECharts } from '$lib/echarts/runtime';
	import { formatDollar, formatPercent } from '$lib/helpers/formatters';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import { onMount, tick } from 'svelte';
	import { buildMarketSharePieSlices, type MarketShareChartItem, type MarketSharePieSlice } from './market-share-pie';

	interface Props {
		items: MarketShareChartItem[];
		groupLabel: string;
		groupLabelPlural: string;
		testId?: string;
		class?: string;
	}

	let { items, groupLabel, groupLabelPlural, testId = 'market-share-pie-chart', class: classes = '' }: Props = $props();

	const palette = [
		'#22c55e',
		'#38bdf8',
		'#f59e0b',
		'#ef4444',
		'#14b8a6',
		'#f97316',
		'#8b5cf6',
		'#eab308',
		'#06b6d4',
		'#84cc16',
		'#64748b'
	];

	let slices = $derived(buildMarketSharePieSlices(items, { groupLabelPlural }));
	let chartContainer = $state<HTMLDivElement | null>(null);
	let chartInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let resizeObserver = $state<ResizeObserver | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let runtimeReady = $state(false);
	const TOOLTIP_TITLE_STYLE = `color: #ffffff; font-family: ${chartFontFamily}; font-size: 1.05rem; font-weight: 700; line-height: 1.35;`;
	const TOOLTIP_ROW_STYLE = `display: flex; align-items: baseline; justify-content: space-between; gap: 0.9rem; color: #d5deea; font-family: ${chartFontFamily}; line-height: 1.45;`;
	const TOOLTIP_LABEL_STYLE = 'color: rgba(226, 232, 240, 0.78); font-weight: 600;';
	const TOOLTIP_VALUE_STYLE = 'color: #f8fafc; text-align: right;';

	function toTitleCase(value: string): string {
		return value.charAt(0).toUpperCase() + value.slice(1);
	}

	function formatLabelPercentage(value: number): string {
		return value >= 10 ? value.toFixed(0) : value.toFixed(1);
	}

	function buildLabelRichStyles(isMobile: boolean) {
		const rich: Record<string, Record<string, unknown>> = {
			label: {
				color: '#f8fbff',
				fontFamily: chartFontFamily,
				fontWeight: 700,
				fontSize: isMobile ? 10 : 11,
				lineHeight: isMobile ? 14 : 15,
				align: 'center',
				verticalAlign: 'middle'
			},
			value: {
				color: '#dbeafe',
				fontFamily: chartFontFamily,
				fontWeight: 600,
				fontSize: isMobile ? 10 : 10.5,
				lineHeight: isMobile ? 13 : 14,
				align: 'center',
				verticalAlign: 'middle'
			}
		};

		return rich;
	}

	function buildTooltipRow(label: string, value: string): string {
		return `<div class="tooltip-row" style="${TOOLTIP_ROW_STYLE}"><span style="${TOOLTIP_LABEL_STYLE}">${escapeHtml(label)}</span><strong style="${TOOLTIP_VALUE_STYLE}">${value}</strong></div>`;
	}

	function buildTooltip(slice: MarketSharePieSlice): string {
		const titleLogo = slice.isOther ? '' : renderTooltipLogo(slice.logoUrl, `${slice.label} logo`);
		const titleLabel = escapeHtml(slice.label);
		const title = titleLogo
			? `<span style="display: inline-flex; align-items: center; gap: 0.55rem; vertical-align: middle;">${titleLogo}<span>${titleLabel}</span></span>`
			: `<span>${titleLabel}</span>`;
		const showNameRow = slice.name !== slice.label;
		const groupedLabel = `${toTitleCase(groupLabelPlural)} grouped`;
		const hint = slice.isOther
			? ''
			: `<div class="tooltip-hint" style="margin-top: 0.75rem; display: inline-flex; align-items: center; border: 1px solid rgba(191, 219, 254, 0.16); border-radius: 999px; padding: 0.38rem 0.72rem; color: #f8fafc; font-family: ${chartFontFamily}; background: rgba(125, 211, 252, 0.08); box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.06);"><span style="text-decoration: underline;">Click to view more</span></div>`;

		return [
			`<div style="margin-bottom: 0.7rem; padding-bottom: 0.65rem; border-bottom: 1px solid rgba(191, 219, 254, 0.12);"><div class="tooltip-title" style="${TOOLTIP_TITLE_STYLE}">${title}</div>${showNameRow ? `<div style="margin-top: 0.18rem; color: rgba(226, 232, 240, 0.76); font-family: ${chartFontFamily}; line-height: 1.35;">${escapeHtml(slice.name)}</div>` : ''}</div>`,
			buildTooltipRow('TVL', formatDollar(slice.tvl, 2)),
			buildTooltipRow('APY', formatPercent(slice.avgApy)),
			buildTooltipRow('Share', `${slice.percentage.toFixed(1)}%`),
			slice.isOther && slice.memberCount ? buildTooltipRow(groupedLabel, String(slice.memberCount)) : '',
			hint
		].join('');
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

		if (slices.length === 0) {
			error = `No ${groupLabel.toLowerCase()} TVL data available for the chart.`;
			loading = false;
			destroyChart();
			return;
		}

		const existingInstance = echartsApi.getInstanceByDom(chartContainer);
		existingInstance?.dispose();
		destroyChart();

		const isMobile = window.innerWidth <= 768;
		const labelRichStyles = buildLabelRichStyles(isMobile);
		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 450,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			color: palette,
			tooltip: {
				trigger: 'item',
				appendToBody: true,
				backgroundColor: 'rgba(6, 13, 24, 0.8)',
				borderColor: 'rgba(191, 219, 254, 0.16)',
				borderWidth: 1,
				padding: [14, 14, 12, 14],
				extraCssText: [
					'border-radius: 18px',
					'backdrop-filter: blur(18px) saturate(145%)',
					'-webkit-backdrop-filter: blur(18px) saturate(145%)',
					'box-shadow: 0 1.4rem 3rem rgba(2, 6, 23, 0.46), inset 0 1px 0 rgba(255, 255, 255, 0.09)',
					'overflow: hidden'
				].join(';'),
				textStyle: {
					color: '#f8fafc',
					fontFamily: chartFontFamily,
					fontSize: 12,
					lineHeight: 20
				},
				formatter: (params: { data?: MarketSharePieSlice }) => {
					const slice = params.data;
					return slice ? buildTooltip(slice) : '';
				}
			},
			series: [
				{
					name: `${groupLabel} TVL`,
					type: 'pie',
					radius: isMobile ? ['31%', '62%'] : ['35%', '70%'],
					center: ['50%', '53%'],
					avoidLabelOverlap: true,
					minAngle: 2,
					itemStyle: {
						borderColor: 'rgba(255, 255, 255, 0.08)',
						borderWidth: 1,
						shadowBlur: 6,
						shadowColor: 'rgba(15, 23, 42, 0.16)'
					},
					label: {
						show: true,
						color: '#f8fbff',
						fontFamily: chartFontFamily,
						fontSize: isMobile ? 11 : 12,
						lineHeight: isMobile ? 16 : 18,
						padding: isMobile ? [5, 9, 5, 9] : [6, 11, 6, 11],
						borderRadius: 999,
						backgroundColor: 'rgba(255, 255, 255, 0.14)',
						shadowBlur: 10,
						shadowColor: 'rgba(15, 23, 42, 0.16)',
						formatter: (params: { data?: MarketSharePieSlice }) => {
							const slice = params.data;
							if (!slice) return '';
							return `{label|${slice.label}}\n{value|${formatLabelPercentage(slice.percentage)}%}`;
						},
						rich: labelRichStyles
					},
					labelLine: {
						show: true,
						length: isMobile ? 10 : 14,
						length2: isMobile ? 10 : 16,
						lineStyle: {
							color: 'rgba(191, 219, 254, 0.55)',
							width: 1.2
						}
					},
					labelLayout: {
						hideOverlap: true
					},
					emphasis: {
						scale: true,
						scaleSize: 12,
						itemStyle: {
							shadowBlur: 20,
							shadowColor: 'rgba(56, 189, 248, 0.22)'
						}
					},
					data: slices
				}
			]
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
		slices;
		groupLabel;
		groupLabelPlural;
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

<div class={['market-share-pie-chart', classes]} data-testid={testId}>
	<div class="chart-stage" class:obscured={loading || !!error}>
		<div class="chart-stage-glow"></div>
		<div class="chart-stage-reflection"></div>
		<div bind:this={chartContainer} class="chart"></div>
	</div>
	{#if loading}
		<div class="loading-overlay">
			<Spinner size="48" />
		</div>
	{/if}
	{#if error}
		<p class="error">{error}</p>
	{/if}
</div>

<style>
	.market-share-pie-chart {
		position: relative;
		min-height: 19rem;
		width: 100%;
	}

	.chart-stage {
		position: relative;
		overflow: hidden;
		min-height: 23rem;
		border-radius: 0.65rem;
		background: transparent;
	}

	.chart-stage::before,
	.chart-stage::after {
		content: '';
		position: absolute;
		inset: 0;
		pointer-events: none;
		border-radius: inherit;
	}

	.chart-stage::before {
		inset: 1.5rem 1rem 1rem;
		background:
			radial-gradient(circle at 50% 56%, rgba(255, 255, 255, 0.08) 0%, rgba(255, 255, 255, 0.02) 30%, transparent 58%),
			radial-gradient(circle at 50% 56%, color-mix(in srgb, var(--c-info), transparent 94%) 0%, transparent 56%);
		filter: blur(0.18rem);
		opacity: 0.7;
	}

	.chart-stage::after {
		display: none;
	}

	.chart-stage-glow,
	.chart-stage-reflection {
		position: absolute;
		pointer-events: none;
		border-radius: 999px;
	}

	.chart-stage-glow {
		inset: auto 14% 8% 14%;
		height: 34%;
		background:
			radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--c-info), transparent 90%), transparent 52%),
			radial-gradient(circle at 34% 32%, color-mix(in srgb, var(--c-bullish), transparent 96%), transparent 34%);
		filter: blur(1.8rem);
		opacity: 0.72;
	}

	.chart-stage-reflection {
		top: 0.35rem;
		right: 0.6rem;
		width: 30%;
		height: 11%;
		background: linear-gradient(180deg, color-mix(in srgb, white, transparent 84%), transparent);
		filter: blur(0.46rem);
		opacity: 0.42;
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 0.65rem;
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 10%),
				color-mix(in srgb, var(--c-box-1), transparent 22%)
			),
			linear-gradient(135deg, color-mix(in srgb, white, transparent 94%), transparent 36%);
		backdrop-filter: blur(0.95rem) saturate(1.18);
		-webkit-backdrop-filter: blur(0.95rem) saturate(1.18);
		box-shadow:
			inset 0 1px 0 color-mix(in srgb, white, transparent 74%),
			0 1.1rem 2.4rem color-mix(in srgb, var(--c-text-inverted), transparent 88%);
	}

	.chart {
		position: relative;
		z-index: 1;
		width: 100%;
		height: 23rem;
	}

	.chart-stage.obscured .chart {
		visibility: hidden;
	}

	.error {
		position: absolute;
		inset: 0;
		z-index: 3;
		display: grid;
		place-items: center;
		margin: 0;
		padding: 1rem 1.25rem;
		border-radius: 0.65rem;
		text-align: center;
		color: color-mix(in srgb, var(--c-text-light), white 12%);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 8%),
				color-mix(in srgb, var(--c-box-1), transparent 20%)
			),
			color-mix(in srgb, var(--c-box-1), transparent 10%);
		backdrop-filter: blur(0.9rem) saturate(1.14);
		-webkit-backdrop-filter: blur(0.9rem) saturate(1.14);
		box-shadow: inset 0 1px 0 color-mix(in srgb, white, transparent 76%);
	}

	@media (--viewport-sm-down) {
		.chart-stage {
			min-height: 21rem;
		}

		.chart {
			height: 21rem;
		}
	}
</style>

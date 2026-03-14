<!--
@component
ECharts-based cumulative TVL/APY chart variant for the front page. Loaded lazily
by the parent section and fetches the ECharts runtime from CDN only when needed.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Spinner from '$lib/components/Spinner.svelte';
	import { getLogoUrl } from '$lib/helpers/assets';
	import { getChain } from '$lib/helpers/chain';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import { isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import type { SlimVaultInfo } from '$lib/top-vaults/schemas';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
	import { onMount, tick } from 'svelte';

	const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js';
	const MIN_TVL = 50_000;
	const MAX_APY_THRESHOLD = 10;
	const MIN_APY_CHART_VALUE = 0.01;
	const MAX_X_AXIS_RETURN = 750;
	const Y_AXIS_TOP_PADDING_RATIO = 0.1;
	const TREASURY_URL = resolve('/glossary/risk-free-rate');
	const SAVINGS_URL = resolve('/glossary/fdic-national-rate');
	const BENCHMARK_ORANGE = '#fbbf24';
	const THEME_RED_HOVER = '#c62847';
	const BENCHMARK_LINE_OPACITY = 0.75;
	const BENCHMARK_HIT_SYMBOL_SIZE = 22;
	const BENCHMARK_SAMPLE_COUNT = 96;
	const ECHARTS_AXIS_FONT_STACK = chartFontFamily;
	const TOOLTIP_TITLE_STYLE = `margin-bottom: 0.35rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1.05rem; font-weight: 700; line-height: 1.35;`;
	const TOOLTIP_BODY_STYLE = `color: #d5deea; font-family: ${chartFontFamily};`;
	const TOOLTIP_HINT_STYLE = `margin-top: 0.55rem; color: #f8fafc; font-family: ${chartFontFamily};`;

	type BenchmarkKind = 'treasury' | 'savings';

	interface Props {
		vaults: SlimVaultInfo[];
		savingsRate: number | null;
		treasuryRate: number | null;
	}

	interface VaultPoint {
		value: [number, number];
		name: string;
		chain: string;
		chainLogoUrl?: string;
		protocol: string;
		protocolLogoUrl?: string;
		realApy: number;
		individualTvl: number;
		cumulativeTvl: number;
		tvlBetter: number;
		tvlLess: number;
		totalTvl: number;
		url: string;
	}

	interface BenchmarkPoint {
		value: [number, number];
		benchmarkKind: BenchmarkKind;
		label: string;
		description: string;
		rate: number;
		betterTvl: number;
		worseTvl: number;
		pctBetter: string;
		pctWorse: string;
		url: string;
	}

	interface EChartsClickParams {
		data?: {
			url?: string;
		} | null;
	}

	interface EChartsInstance {
		setOption(option: unknown): void;
		resize(): void;
		dispose(): void;
		on(eventName: 'click', handler: (params: EChartsClickParams) => void): void;
		off(eventName?: string): void;
	}

	interface EChartsStatic {
		init(element: HTMLDivElement): EChartsInstance;
		getInstanceByDom(element: HTMLDivElement): EChartsInstance | undefined;
	}

	let echartsPromise: Promise<EChartsStatic> | null = null;

	let { vaults, savingsRate, treasuryRate }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let loading = $state(true);
	let error = $state<string | null>(null);

	let chartInstance: EChartsInstance | null = null;
	let echartsApi: EChartsStatic | null = null;
	let resizeObserver: ResizeObserver | null = null;

	function getCagr(vault: SlimVaultInfo): number | null {
		return vault.one_month_cagr_net ?? vault.one_month_cagr;
	}

	function formatUsd(value: number): string {
		if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
		if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
		if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
		return `$${value.toFixed(0)}`;
	}

	function formatRate(value: number | null, digits = 1): string {
		if (value == null || !Number.isFinite(value)) return 'n/a';
		return `${value.toFixed(digits)}%`;
	}

	function escapeHtml(value: string): string {
		return value
			.replaceAll('&', '&amp;')
			.replaceAll('<', '&lt;')
			.replaceAll('>', '&gt;')
			.replaceAll('"', '&quot;')
			.replaceAll("'", '&#39;');
	}

	function formatAxisPercent(value: number): string {
		if (!Number.isFinite(value)) return '';
		if (value >= 100) return `${value.toFixed(0)}%`;
		if (value >= 10) return `${value.toFixed(1).replace(/\.0$/, '')}%`;
		if (value >= 1) return `${value.toFixed(1).replace(/\.0$/, '')}%`;
		return `${value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
	}

	function renderTooltipLogo(url: string | undefined, alt: string, size = 18): string {
		if (!url) return '';
		const safeAlt = escapeHtml(alt);
		return `<img src="${escapeHtml(url)}" alt="${safeAlt}" width="${size}" height="${size}" style="width: ${size}px; height: ${size}px; border-radius: 999px; object-fit: contain; flex: 0 0 auto;" onerror="this.style.display='none'">`;
	}

	function buildVaultTooltipMeta(point: VaultPoint): string {
		const chainLogo = renderTooltipLogo(point.chainLogoUrl, `${point.chain} logo`);
		const protocolLogo = renderTooltipLogo(point.protocolLogoUrl, `${point.protocol} logo`);
		const chainLabel = chainLogo
			? `<span style="display: inline-flex; align-items: center; gap: 0.45rem; vertical-align: middle;">${chainLogo}<span>${escapeHtml(point.chain)}</span></span>`
			: `<span>${escapeHtml(point.chain)}</span>`;
		const protocolLabel = protocolLogo
			? `<span style="display: inline-flex; align-items: center; gap: 0.45rem; vertical-align: middle;">${protocolLogo}<span>${escapeHtml(point.protocol)}</span></span>`
			: `<span>${escapeHtml(point.protocol)}</span>`;

		return `<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}; display: flex; align-items: center; gap: 0.4rem; flex-wrap: wrap;">${chainLabel}<span aria-hidden="true">·</span>${protocolLabel}</div>`;
	}

	function getEligibleVaults(sourceVaults: SlimVaultInfo[]): SlimVaultInfo[] {
		return sourceVaults
			.filter((vault) => {
				if (isBlacklisted(vault)) return false;
				if (vault.current_nav == null || vault.current_nav < MIN_TVL) return false;

				const apy = getCagr(vault);
				return apy != null && apy <= MAX_APY_THRESHOLD;
			})
			.toSorted((left, right) => (getCagr(right) ?? 0) - (getCagr(left) ?? 0));
	}

	function buildVaultTooltip(point: VaultPoint): string {
		return [
			`<div class="tooltip-title" style="${TOOLTIP_TITLE_STYLE}">${escapeHtml(point.name)}</div>`,
			buildVaultTooltipMeta(point),
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}"><strong>Returns annualised:</strong> ${formatRate(point.realApy)}</div>`,
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}"><strong>Vault TVL:</strong> ${formatUsd(point.individualTvl)}</div>`,
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}"><strong>TVL earning less than this:</strong> ${point.totalTvl > 0 ? ((point.tvlLess / point.totalTvl) * 100).toFixed(1) : '0.0'}% (${formatUsd(point.tvlLess)})</div>`,
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}"><strong>TVL earning better than this:</strong> ${point.totalTvl > 0 ? ((point.tvlBetter / point.totalTvl) * 100).toFixed(1) : '0.0'}% (${formatUsd(point.tvlBetter)})</div>`,
			`<div class="tooltip-hint" style="${TOOLTIP_HINT_STYLE}"><span style="text-decoration: underline;">Click to open vault details</span></div>`
		].join('');
	}

	function buildBenchmarkTooltip(point: BenchmarkPoint): string {
		return [
			`<div class="tooltip-title" style="${TOOLTIP_TITLE_STYLE}">${escapeHtml(point.label)} (${formatRate(point.rate, point.benchmarkKind === 'savings' ? 2 : 1)})</div>`,
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}">${escapeHtml(point.description)}</div>`,
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}"><strong>Earning better:</strong> ${formatUsd(point.betterTvl)} (${point.pctBetter}%)</div>`,
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}"><strong>Earning less:</strong> ${formatUsd(point.worseTvl)} (${point.pctWorse}%)</div>`,
			`<div class="tooltip-hint" style="${TOOLTIP_HINT_STYLE}"><span style="text-decoration: underline;">Click to open glossary entry</span></div>`
		].join('');
	}

	function getWindowECharts(): EChartsStatic | undefined {
		return (window as Window & { echarts?: EChartsStatic }).echarts;
	}

	async function loadECharts(): Promise<EChartsStatic> {
		const existingApi = getWindowECharts();
		if (existingApi) return existingApi;
		if (echartsPromise) return echartsPromise;

		echartsPromise = new Promise<EChartsStatic>((resolvePromise, rejectPromise) => {
			const existingScript = document.querySelector<HTMLScriptElement>(`script[src="${ECHARTS_CDN}"]`);

			const handleLoad = () => {
				const loadedApi = getWindowECharts();
				if (loadedApi) {
					resolvePromise(loadedApi);
					return;
				}

				rejectPromise(new Error('ECharts loaded but no global API was exposed.'));
			};

			if (existingScript) {
				const loadedApi = getWindowECharts();
				if (loadedApi) {
					resolvePromise(loadedApi);
					return;
				}

				existingScript.addEventListener('load', handleLoad, { once: true });
				existingScript.addEventListener('error', () => rejectPromise(new Error('Failed to load ECharts.')), {
					once: true
				});
				return;
			}

			const script = document.createElement('script');
			script.src = ECHARTS_CDN;
			script.async = true;
			script.referrerPolicy = 'no-referrer';
			script.addEventListener('load', handleLoad, { once: true });
			script.addEventListener('error', () => rejectPromise(new Error('Failed to load ECharts from CDN.')), {
				once: true
			});
			document.head.append(script);
		});

		return echartsPromise;
	}

	function buildBenchmarkSeries(kind: BenchmarkKind, rate: number, points: VaultPoint[], yMin: number, yMax: number) {
		let betterTvl = 0;
		let worseTvl = 0;

		for (const point of points) {
			if (point.realApy > rate) betterTvl += point.individualTvl;
			else worseTvl += point.individualTvl;
		}

		const totalTvl = betterTvl + worseTvl;
		const benchmarkLabel = kind === 'treasury' ? 'US Treasury note rate' : 'US bank savings rate';
		const benchmarkDescription =
			kind === 'treasury' ? 'The risk-free benchmark.' : 'Average yield on a US bank savings account.';
		const benchmarkUrl = kind === 'treasury' ? TREASURY_URL : SAVINGS_URL;
		const benchmarkData = Array.from({ length: BENCHMARK_SAMPLE_COUNT }, (_, index) => {
			const ratio = index / Math.max(BENCHMARK_SAMPLE_COUNT - 1, 1);
			const yValue = yMin * Math.pow(yMax / yMin, ratio);

			return {
				value: [rate, yValue] as [number, number],
				benchmarkKind: kind,
				label: benchmarkLabel,
				description: benchmarkDescription,
				rate,
				betterTvl,
				worseTvl,
				pctBetter: totalTvl > 0 ? ((betterTvl / totalTvl) * 100).toFixed(1) : '0.0',
				pctWorse: totalTvl > 0 ? ((worseTvl / totalTvl) * 100).toFixed(1) : '0.0',
				url: benchmarkUrl
			};
		});

		return {
			name: benchmarkLabel,
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
			tooltip: {
				trigger: 'item'
			},
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
			data: benchmarkData
		};
	}

	function buildChartOption(sourceVaults: SlimVaultInfo[]) {
		const eligibleVaults = getEligibleVaults(sourceVaults);
		if (eligibleVaults.length === 0) {
			throw new Error('No vault data available.');
		}

		const points: VaultPoint[] = [];
		let runningTvl = 0;

		for (const vault of eligibleVaults) {
			const rawApy = getCagr(vault);
			const realApy = (rawApy ?? 0) * 100;
			const vaultTvl = vault.current_nav ?? 0;
			const chain = getChain(vault.chain_id);
			runningTvl += vaultTvl;

			points.push({
				value: [Math.max(realApy, MIN_APY_CHART_VALUE), runningTvl],
				name: vault.name,
				chain: vault.chain ?? 'Unknown',
				chainLogoUrl: getLogoUrl('blockchain', chain?.slug),
				protocol: vault.protocol ?? 'Unknown',
				protocolLogoUrl: getVaultProtocolLogoUrl(vault.protocol_slug),
				realApy,
				individualTvl: vaultTvl,
				cumulativeTvl: runningTvl,
				tvlBetter: 0,
				tvlLess: 0,
				totalTvl: 0,
				url: resolveVaultDetails(vault)
			});
		}

		const totalTvl = points.at(-1)?.cumulativeTvl ?? 0;
		for (const point of points) {
			point.totalTvl = totalTvl;
			point.tvlBetter = point.cumulativeTvl - point.individualTvl;
			point.tvlLess = totalTvl - point.cumulativeTvl;
		}

		const xValues = points.map((point) => point.value[0]);
		const yValues = points.map((point) => point.value[1]);
		const xAxisMax = Math.min(Math.max(...xValues, treasuryRate ?? 0, savingsRate ?? 0, 0.1), MAX_X_AXIS_RETURN);
		const yAxisMin = Math.min(...yValues);
		const highestYValue = Math.max(...yValues);
		const visibleChartRatio = 1 - Y_AXIS_TOP_PADDING_RATIO;
		const yAxisMax =
			highestYValue > yAxisMin
				? yAxisMin * Math.pow(highestYValue / yAxisMin, 1 / visibleChartRatio)
				: highestYValue * 1.1;

		const mainSeries = {
			name: 'Cumulative TVL',
			type: 'line',
			smooth: false,
			showSymbol: true,
			symbol: 'circle',
			symbolSize: 8,
			lineStyle: {
				color: '#22c55e',
				width: 3
			},
			itemStyle: {
				color: '#22c55e',
				opacity: 0.5
			},
			areaStyle: {
				color: {
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
				}
			},
			emphasis: {
				focus: 'none',
				scale: 4,
				itemStyle: {
					color: THEME_RED_HOVER,
					opacity: 0.5
				}
			},
			z: 4,
			data: points
		};

		const series: unknown[] = [mainSeries];
		if (treasuryRate != null) {
			series.push(buildBenchmarkSeries('treasury', treasuryRate, points, yAxisMin, yAxisMax));
		}
		if (savingsRate != null) {
			series.push(buildBenchmarkSeries('savings', savingsRate, points, yAxisMin, yAxisMax));
		}

		return {
			series,
			xAxisMax,
			yAxisMin,
			yAxisMax
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

		const { series, xAxisMax, yAxisMin, yAxisMax } = buildChartOption(vaults);
		const existingInstance = echartsApi.getInstanceByDom(chartContainer);
		existingInstance?.dispose();
		destroyChart();

		const isMobile = window.innerWidth <= 768;

		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 450,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				show: true,
				top: isMobile ? 46 : 64,
				right: isMobile ? 48 : 68,
				bottom: isMobile ? 48 : 64,
				left: isMobile ? 48 : 68,
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
					fontSize: 13,
					lineHeight: 20
				},
				formatter: (params: { data?: VaultPoint | BenchmarkPoint }) => {
					const point = params.data;
					if (!point) return '';
					return 'benchmarkKind' in point ? buildBenchmarkTooltip(point) : buildVaultTooltip(point);
				}
			},
			xAxis: {
				type: 'log',
				name: isMobile ? '' : 'Returns (last month annualised)',
				nameLocation: 'middle',
				nameGap: 40,
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: ECHARTS_AXIS_FONT_STACK,
					fontSize: 13,
					fontWeight: 600,
					align: 'center'
				},
				inverse: true,
				min: MIN_APY_CHART_VALUE,
				max: xAxisMax,
				axisLine: {
					lineStyle: {
						color: '#64748b'
					}
				},
				axisLabel: {
					color: '#e2e8f0',
					fontFamily: ECHARTS_AXIS_FONT_STACK,
					fontSize: 11,
					fontWeight: 600,
					align: 'left',
					margin: 10,
					formatter: (value: number) => {
						if (value > xAxisMax * 1.0000001) return '';
						return formatAxisPercent(value);
					}
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(148, 163, 184, 0.18)'
					}
				}
			},
			yAxis: {
				type: 'log',
				name: isMobile ? '' : 'TVL',
				nameLocation: 'end',
				nameRotate: 0,
				nameGap: 16,
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: ECHARTS_AXIS_FONT_STACK,
					fontSize: 13,
					fontWeight: 600
				},
				position: 'right',
				min: yAxisMin,
				max: yAxisMax,
				axisLine: {
					lineStyle: {
						color: '#64748b'
					}
				},
				axisLabel: {
					color: '#e2e8f0',
					fontFamily: ECHARTS_AXIS_FONT_STACK,
					fontSize: 11,
					fontWeight: 600,
					formatter: (value: number) => formatUsd(value)
				},
				splitLine: {
					lineStyle: {
						color: 'rgba(148, 163, 184, 0.18)'
					}
				}
			},
			series
		});

		chartInstance.on('click', (params) => {
			const targetUrl = params.data?.url;
			if (targetUrl) goto(targetUrl);
		});

		attachResizeHandling();
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
</script>

<div class="ecosystem-chart echarts-ecosystem-chart">
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
	.ecosystem-chart {
		position: relative;
		min-height: 400px;
		max-width: 960px;
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
		height: 400px;
		position: relative;
		z-index: 0;

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

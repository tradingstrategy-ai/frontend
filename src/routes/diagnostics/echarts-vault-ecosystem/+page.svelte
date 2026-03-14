<!--
ECharts diagnostics page for experimenting with the vault ecosystem chart.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Alert from '$lib/components/Alert.svelte';
	import Button from '$lib/components/Button.svelte';
	import HeroBanner from '$lib/components/HeroBanner.svelte';
	import Section from '$lib/components/Section.svelte';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import { isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import type { SlimVaultInfo } from '$lib/top-vaults/schemas';
	import { onMount, tick } from 'svelte';
	import type { PageData } from './$types';

	const ECHARTS_CDN = 'https://cdn.jsdelivr.net/npm/echarts@5.6.0/dist/echarts.min.js';
	const MIN_TVL = 50_000;
	const MAX_APY_THRESHOLD = 10;
	const MIN_APY_CHART_VALUE = 0.01;
	const MAX_X_AXIS_RETURN = 750;
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

	interface DiagnosticsSummary {
		totalVaultCount: number;
		eligibleVaultCount: number;
		totalTvl: number;
		highestApy: number | null;
		lowestApy: number | null;
	}

	interface VaultPoint {
		value: [number, number];
		name: string;
		chain: string;
		protocol: string;
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

	let { data }: { data: PageData } = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let vaults = $state<SlimVaultInfo[]>([]);
	let loading = $state(true);
	let loadingMessage = $state('Loading ECharts and vault data…');
	let error = $state<string | null>(null);
	let fetchedAt = $state<string | null>(null);
	let summary = $state<DiagnosticsSummary | null>(null);

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
			`<div class="tooltip-row" style="${TOOLTIP_BODY_STYLE}">${escapeHtml(point.chain)} · ${escapeHtml(point.protocol)}</div>`,
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

	async function fetchChartData(signal?: AbortSignal): Promise<SlimVaultInfo[]> {
		const response = await fetch(resolve('/top-vaults/chart-data'), {
			headers: { accept: 'application/json' },
			signal
		});

		if (!response.ok) {
			throw new Error(`Chart data request failed with ${response.status}`);
		}

		const payload = (await response.json()) as { vaults?: SlimVaultInfo[] };
		if (!Array.isArray(payload.vaults)) {
			throw new Error('Chart data payload did not include vaults.');
		}

		return payload.vaults;
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
			emphasisDisabled: false,
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
			throw new Error('No vaults matched the diagnostics filters.');
		}

		const points: VaultPoint[] = [];
		let runningTvl = 0;

		for (const vault of eligibleVaults) {
			const rawApy = getCagr(vault);
			const realApy = (rawApy ?? 0) * 100;
			const vaultTvl = vault.current_nav ?? 0;
			runningTvl += vaultTvl;

			points.push({
				value: [Math.max(realApy, MIN_APY_CHART_VALUE), runningTvl],
				name: vault.name,
				chain: vault.chain ?? 'Unknown',
				protocol: vault.protocol ?? 'Unknown',
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
		const xAxisMax = Math.min(
			Math.max(...xValues, data.treasuryRate ?? 0, data.savingsRate ?? 0, 0.1),
			MAX_X_AXIS_RETURN
		);
		const yAxisMin = Math.min(...yValues);
		const yAxisMax = Math.max(...yValues);

		summary = {
			totalVaultCount: sourceVaults.length,
			eligibleVaultCount: eligibleVaults.length,
			totalTvl,
			highestApy: points[0]?.realApy ?? null,
			lowestApy: points.at(-1)?.realApy ?? null
		};

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
		if (data.treasuryRate != null) {
			series.push(buildBenchmarkSeries('treasury', data.treasuryRate, points, yAxisMin, yAxisMax));
		}
		if (data.savingsRate != null) {
			series.push(buildBenchmarkSeries('savings', data.savingsRate, points, yAxisMin, yAxisMax));
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

		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 450,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				show: true,
				top: 84,
				right: 80,
				bottom: 84,
				left: 80,
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
				name: 'Returns (last month annualised)',
				nameLocation: 'middle',
				nameGap: 44,
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: ECHARTS_AXIS_FONT_STACK,
					fontSize: 18,
					fontWeight: 600
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
					fontSize: 15,
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
				name: 'TVL',
				nameLocation: 'middle',
				nameGap: 60,
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: ECHARTS_AXIS_FONT_STACK,
					fontSize: 18,
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
					fontSize: 15,
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

	async function refreshDiagnostics() {
		loading = true;
		loadingMessage = 'Refreshing chart data…';
		error = null;

		try {
			const [nextEcharts, nextVaults] = await Promise.all([loadECharts(), fetchChartData()]);
			echartsApi = nextEcharts;
			vaults = nextVaults;
			fetchedAt = new Date().toLocaleString('en-GB');
			await tick();
			await renderChart();
		} catch (loadError) {
			error = loadError instanceof Error ? loadError.message : 'Failed to refresh diagnostics chart.';
			loading = false;
			destroyChart();
		}
	}

	onMount(() => {
		const abortController = new AbortController();
		let disposed = false;

		const handleWindowResize = () => chartInstance?.resize();
		window.addEventListener('resize', handleWindowResize);

		(async () => {
			try {
				const [nextEcharts, nextVaults] = await Promise.all([loadECharts(), fetchChartData(abortController.signal)]);

				if (disposed) return;

				echartsApi = nextEcharts;
				vaults = nextVaults;
				fetchedAt = new Date().toLocaleString('en-GB');
				await tick();
				if (disposed) return;

				await renderChart();
			} catch (loadError) {
				if (disposed || abortController.signal.aborted) return;

				error = loadError instanceof Error ? loadError.message : 'Failed to initialise diagnostics chart.';
				loading = false;
				destroyChart();
			}
		})();

		return () => {
			disposed = true;
			abortController.abort();
			window.removeEventListener('resize', handleWindowResize);
			destroyChart();
		};
	});
</script>

<svelte:head>
	<title>ECharts vault ecosystem diagnostics</title>
	<meta
		name="description"
		content="Standalone ECharts diagnostics page for comparing the vault ecosystem chart against the current site behaviour."
	/>
	<meta name="robots" content="noindex,nofollow" />
</svelte:head>

<main class="diagnostics-page">
	<Section tag="header" padding="sm">
		<HeroBanner>
			{#snippet title()}
				<span>ECharts vault ecosystem diagnostics</span>
			{/snippet}
			{#snippet subtitle()}
				Standalone rendering of the front-page vault ecosystem chart with
				<a href={TREASURY_URL}>US Treasury note</a> and <a href={SAVINGS_URL}>National Savings Rate</a>
				benchmarks for visual experimentation.
			{/snippet}
		</HeroBanner>
	</Section>

	<Section padding="xs" gap="xs">
		<div class="toolbar">
			<div class="summary-copy">
				<p>
					Uses the same filters as the front page: blacklisted vaults removed, minimum TVL of {formatUsd(MIN_TVL)}, APY
					capped at {formatRate(MAX_APY_THRESHOLD * 100, 0)}, and one-month net CAGR preferred when available.
				</p>
				{#if fetchedAt}
					<p class="fetched-at">Last fetched: {fetchedAt}</p>
				{/if}
			</div>
			<div class="actions">
				<Button secondary size="sm" label="Reload chart data" on:click={refreshDiagnostics} />
			</div>
		</div>

		{#if data.treasuryRate == null || data.savingsRate == null}
			<Alert status="warning" size="sm">
				One or more server-side benchmark rates were unavailable, so the corresponding reference line is omitted.
			</Alert>
		{/if}

		{#if summary}
			<div class="stats-grid">
				<div class="stat-card">
					<span class="stat-label">Eligible vaults</span>
					<strong>{summary.eligibleVaultCount}</strong>
					<span>from {summary.totalVaultCount} fetched vaults</span>
				</div>
				<div class="stat-card">
					<span class="stat-label">Cumulative TVL</span>
					<strong>{formatUsd(summary.totalTvl)}</strong>
					<span>after diagnostics filtering</span>
				</div>
				<div class="stat-card">
					<span class="stat-label">Displayed APY span</span>
					<strong>{formatRate(summary.highestApy)} to {formatRate(summary.lowestApy)}</strong>
					<span>using last-month annualised returns</span>
				</div>
			</div>
		{/if}

		{#if error}
			<Alert status="error" size="sm">{error}</Alert>
		{/if}

		<div class="chart-shell">
			{#if loading}
				<div class="chart-overlay" aria-live="polite">
					<div>
						<p>{loadingMessage}</p>
						<span>Fetching vault data and preparing the ECharts render.</span>
					</div>
				</div>
			{/if}

			<div bind:this={chartContainer} class="chart-canvas" class:chart-hidden={!!error && !loading}></div>
		</div>
	</Section>
</main>

<style>
	.diagnostics-page {
		display: grid;
		gap: var(--space-sm);

		:global(.subtitle a) {
			text-decoration: underline;
		}
	}

	.toolbar {
		display: flex;
		gap: var(--space-md);
		justify-content: space-between;
		align-items: end;

		@media (--viewport-sm-down) {
			flex-direction: column;
			align-items: stretch;
		}
	}

	.summary-copy {
		display: grid;
		gap: 0.35rem;
		max-width: 68rem;

		p {
			margin: 0;
			font: var(--f-ui-md-roman);
			color: var(--c-text-extra-light);
		}
	}

	.fetched-at {
		font: var(--f-ui-sm-roman);
	}

	.actions {
		display: flex;
		justify-content: flex-end;
	}

	.stats-grid {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: var(--space-md);

		@media (--viewport-md-down) {
			grid-template-columns: 1fr;
		}
	}

	.stat-card {
		display: grid;
		gap: 0.35rem;
		padding: 1rem 1.125rem;
		border: 1px solid color-mix(in srgb, var(--c-text-light), transparent 82%);
		border-radius: var(--radius-lg);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c-box-2), transparent 8%), transparent),
			color-mix(in srgb, var(--c-box-2), transparent 22%);

		strong {
			font: var(--f-heading-sm-medium);
			letter-spacing: var(--f-heading-sm-spacing, normal);
		}

		span {
			color: var(--c-text-extra-light);
			font: var(--f-ui-sm-roman);
		}
	}

	.stat-label {
		text-transform: uppercase;
		letter-spacing: 0.08em;
	}

	.chart-shell {
		position: relative;
		min-height: 640px;
		padding: clamp(0.75rem, 1.8vw, 1rem);
		border-radius: var(--radius-xl);
		border: 1px solid color-mix(in srgb, var(--c-text-light), transparent 84%);
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
		overflow: hidden;

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

		@media (--viewport-sm-down) {
			min-height: 520px;
		}
	}

	.chart-canvas {
		width: 100%;
		height: 640px;
		position: relative;
		z-index: 0;

		@media (--viewport-sm-down) {
			height: 520px;
		}
	}

	.chart-hidden {
		visibility: hidden;
		pointer-events: none;
	}

	.chart-overlay {
		position: absolute;
		inset: 0;
		z-index: 2;
		display: grid;
		place-items: center;
		padding: 1.5rem;
		background: color-mix(in srgb, var(--c-body), transparent 18%);
		backdrop-filter: blur(0.35rem);

		div {
			display: grid;
			gap: 0.35rem;
			text-align: center;
			padding: 1rem 1.25rem;
			border-radius: var(--radius-lg);
			border: 1px solid color-mix(in srgb, var(--c-text-light), transparent 82%);
			background: color-mix(in srgb, var(--c-box-1), transparent 8%);
		}

		p {
			margin: 0;
			font: var(--f-ui-lg-medium);
		}

		span {
			color: var(--c-text-extra-light);
			font: var(--f-ui-sm-roman);
		}
	}
</style>

<!--
@component
Two ECharts visualisations for stablecoin vault returns and TVL by CORE3 protocol risk score.

- Hexbin chart: vault 3M annualised return by CORE3 score, sized by TVL
- Bar chart: stablecoin vault TVL by CORE3 score band, including unrated TVL

@example

```svelte
	<Core3RiskCharts data={chartData} dataLoading={loading} error={error} />
```
-->
<script lang="ts">
	import { browser } from '$app/environment';
	import { escapeHtml, formatRate, formatUsd } from '$lib/echarts/cumulative-tvl-apy';
	import type { Core3RiskBand, Core3RiskPayload } from '$lib/echarts/core3-risk';
	import { type EChartsStatic, loadECharts } from '$lib/echarts/runtime';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';
	import { chartFontFamily, minReturnLog } from '$lib/scatter-plot/helpers';
	import { onMount, tick } from 'svelte';

	interface Props {
		data: Core3RiskPayload | null;
		dataLoading?: boolean;
		error?: string | null;
	}

	type BandDatum = Core3RiskBand & {
		value: number;
		itemStyle: { color: string };
	};

	type BinnedReturnDatum = {
		value: [number, number, number, number, number];
		vaultCount: number;
		totalTvl: number;
		weightedReturn: number | null;
		averageScore: number;
		topProtocols: string[];
		topVaults: Array<{ name: string; protocol: string; tvl: number; href: string }>;
		itemStyle: { color: string };
	};

	let { data, dataLoading = false, error = null }: Props = $props();

	let hexbinContainer = $state<HTMLDivElement | null>(null);
	let bandContainer = $state<HTMLDivElement | null>(null);
	let hexbinInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let bandInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let resizeObserver = $state<ResizeObserver | null>(null);
	let runtimeReady = $state(false);
	let chartError = $state<string | null>(null);
	let viewportWidth = $state(1440);

	let effectiveError = $derived(error ?? chartError);
	let hasData = $derived(Boolean(data && (data.scatterPoints.length > 0 || data.bands.some((band) => band.tvl > 0))));

	const scoreColourStops = [
		{ score: 20, colour: '#22c55e' },
		{ score: 40, colour: '#84cc16' },
		{ score: 60, colour: '#facc15' },
		{ score: 80, colour: '#f97316' },
		{ score: Number.POSITIVE_INFINITY, colour: '#ef4444' }
	] as const;
	const maxReturnAxisPercent = 500;
	const scoreBucketSize = 10;
	const returnBuckets = [0.01, 0.03, 0.1, 0.3, 1, 3, 10, 30, 100, 300, 500] as const;
	const hexagonSymbol = 'path://M0,-1 L0.866,-0.5 L0.866,0.5 L0,1 L-0.866,0.5 L-0.866,-0.5 Z';

	function getScoreColour(score: number | null | undefined) {
		if (score == null || !Number.isFinite(score)) return '#64748b';
		return scoreColourStops.find((stop) => score < stop.score)?.colour ?? '#ef4444';
	}

	function getBandColour(band: Core3RiskBand) {
		if (band.key === 'not-covered') return '#64748b';
		return getScoreColour(band.minScore == null ? null : band.minScore + 1);
	}

	function formatScore(score: number | null | undefined) {
		return score == null || !Number.isFinite(score) ? 'n/a' : score.toFixed(1).replace(/\.0$/, '');
	}

	function formatReturn(value: number | null | undefined) {
		return formatRate(value == null ? null : value * 100, 1);
	}

	function getPlottedReturnPercent(value: number | null | undefined) {
		if (value == null || !Number.isFinite(value)) return minReturnLog;
		return Math.min(Math.max(value * 100, minReturnLog), maxReturnAxisPercent);
	}

	function formatShare(value: number) {
		if (!Number.isFinite(value)) return '0.0%';
		return `${(value * 100).toFixed(1)}%`;
	}

	function formatReturnPercent(value: number | null | undefined) {
		return formatRate(value ?? null, 1);
	}

	function getReturnBucketIndex(value: number) {
		for (let index = 0; index < returnBuckets.length - 1; index++) {
			if (value >= returnBuckets[index] && value < returnBuckets[index + 1]) return index;
		}
		return returnBuckets.length - 2;
	}

	function getScoreBucketIndex(score: number) {
		return Math.min(Math.floor(score / scoreBucketSize), 9);
	}

	function buildMetricRow(label: string, value: string) {
		return `<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>${label}</span><strong>${value}</strong></div>`;
	}

	function buildBandTooltip(band: BandDatum) {
		const share = data && data.meta.totalStablecoinTvl > 0 ? band.tvl / data.meta.totalStablecoinTvl : 0;

		return [
			`<div style="margin-bottom: 0.45rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1rem; font-weight: 700;">CORE3 score ${escapeHtml(band.label)}</div>`,
			buildMetricRow('Stablecoin vault TVL', formatUsd(band.tvl)),
			buildMetricRow('Share of stablecoin TVL', formatShare(share)),
			buildMetricRow('Vaults', String(band.vaultCount)),
			buildMetricRow('Protocols', String(band.protocolCount)),
			buildMetricRow('TVL-weighted 3M return', formatReturn(band.weightedThreeMonthCagr)),
			buildMetricRow('TVL-weighted 1M return', formatReturn(band.weightedOneMonthCagr)),
			band.key === 'not-covered'
				? `<div style="margin-top: 0.45rem; color: #94a3b8; font-family: ${chartFontFamily};">This TVL belongs to stablecoin vaults whose protocol does not yet have a CORE3 score in our data.</div>`
				: `<div style="margin-top: 0.45rem; color: #94a3b8; font-family: ${chartFontFamily};">Scores are CORE3 Probability of Loss bands; lower is better.</div>`
		].join('');
	}

	function buildBinnedTooltip(point: BinnedReturnDatum) {
		const topVaultRows = point.topVaults
			.map(
				(vault) =>
					`<div style="display: grid; grid-template-columns: minmax(0, 1fr) auto; gap: 0.75rem; color: #d5deea; font-family: ${chartFontFamily};"><span style="min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(vault.name)} <span style="color: #94a3b8;">${escapeHtml(vault.protocol)}</span></span><strong>${formatUsd(vault.tvl)}</strong></div>`
			)
			.join('');

		return [
			`<div style="width: 22rem; max-width: calc(100vw - 2rem); box-sizing: border-box; white-space: normal; overflow-wrap: break-word;">`,
			`<div style="margin-bottom: 0.55rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1rem; font-weight: 700;">~${formatReturnPercent(point.weightedReturn)} return at ${formatScore(point.averageScore)} PoL score</div>`,
			`<div style="display: grid; gap: 0.25rem;">`,
			buildMetricRow('Vaults', String(point.vaultCount)),
			buildMetricRow('Total TVL', formatUsd(point.totalTvl)),
			buildMetricRow(
				'TVL-weighted 3M return',
				formatReturn(point.weightedReturn == null ? null : point.weightedReturn / 100)
			),
			buildMetricRow('Average CORE3 score', formatScore(point.averageScore)),
			point.topProtocols.length ? buildMetricRow('Top protocols', escapeHtml(point.topProtocols.join(', '))) : '',
			`</div>`,
			topVaultRows
				? `<div style="margin-top: 0.65rem; padding-top: 0.55rem; border-top: 1px solid #334155;"><div style="margin-bottom: 0.3rem; color: #94a3b8; font-family: ${chartFontFamily}; font-size: 0.78rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.04em;">Largest vaults by TVL</div><div style="display: grid; gap: 0.2rem;">${topVaultRows}</div></div>`
				: '',
			`<div style="margin-top: 0.55rem; color: #94a3b8; font-family: ${chartFontFamily}; line-height: 1.35; white-space: normal; overflow-wrap: break-word;">Hex size follows total TVL. Colour follows average CORE3 score.</div>`,
			`</div>`
		].join('');
	}

	function buildBandData(): BandDatum[] {
		if (!data) return [];
		return data.bands.map((band) => ({
			...band,
			value: band.tvl,
			itemStyle: { color: getBandColour(band) }
		}));
	}

	function buildBinnedReturnData() {
		const bins = new Map<
			string,
			{
				scoreIndex: number;
				returnIndex: number;
				totalTvl: number;
				vaultCount: number;
				weightedReturnSum: number;
				scoreSum: number;
				protocolCounts: Map<string, number>;
				vaults: Array<{ name: string; protocol: string; tvl: number; href: string }>;
			}
		>();

		for (const point of data?.scatterPoints ?? []) {
			const plottedReturn = getPlottedReturnPercent(point.threeMonthCagr);
			const scoreIndex = getScoreBucketIndex(point.core3Score);
			const returnIndex = getReturnBucketIndex(plottedReturn);
			const key = `${scoreIndex}:${returnIndex}`;
			const bin = bins.get(key) ?? {
				scoreIndex,
				returnIndex,
				totalTvl: 0,
				vaultCount: 0,
				weightedReturnSum: 0,
				scoreSum: 0,
				protocolCounts: new Map<string, number>(),
				vaults: []
			};

			bin.totalTvl += point.tvl;
			bin.vaultCount += 1;
			bin.weightedReturnSum += point.tvl * plottedReturn;
			bin.scoreSum += point.core3Score;
			bin.protocolCounts.set(point.protocol, (bin.protocolCounts.get(point.protocol) ?? 0) + 1);
			bin.vaults.push({ name: point.name, protocol: point.protocol, tvl: point.tvl, href: point.href });
			bins.set(key, bin);
		}

		return [...bins.values()].map((bin) => {
			const scoreCenter = bin.scoreIndex * scoreBucketSize + scoreBucketSize / 2;
			const returnMin = returnBuckets[bin.returnIndex];
			const returnMax = returnBuckets[bin.returnIndex + 1];
			const returnCenter = Math.sqrt(returnMin * returnMax);
			const weightedReturn = bin.totalTvl > 0 ? bin.weightedReturnSum / bin.totalTvl : null;
			const averageScore = bin.scoreSum / bin.vaultCount;
			const topProtocols = [...bin.protocolCounts.entries()]
				.toSorted((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
				.slice(0, 3)
				.map(([protocol]) => protocol);
			const topVaults = bin.vaults
				.toSorted((left, right) => right.tvl - left.tvl || left.name.localeCompare(right.name))
				.slice(0, 3);

			return {
				value: [scoreCenter, returnCenter, bin.vaultCount, bin.totalTvl, weightedReturn ?? 0],
				vaultCount: bin.vaultCount,
				totalTvl: bin.totalTvl,
				weightedReturn,
				averageScore,
				topProtocols,
				topVaults,
				itemStyle: { color: getScoreColour(averageScore) }
			} satisfies BinnedReturnDatum;
		});
	}

	function getTvlSymbolSize(tvl: number, maxTvl: number) {
		if (!Number.isFinite(tvl) || tvl <= 0 || !Number.isFinite(maxTvl) || maxTvl <= 0) return 8;
		return 8 + Math.sqrt(tvl / maxTvl) * 34;
	}

	function buildBaseTooltip() {
		return {
			trigger: 'item',
			appendToBody: true,
			backgroundColor: '#111827',
			borderColor: '#1f2937',
			borderWidth: 1,
			padding: 12,
			textStyle: {
				color: '#f8fafc',
				fontFamily: chartFontFamily,
				fontSize: 14,
				lineHeight: 20
			}
		};
	}

	function destroyCharts() {
		resizeObserver?.disconnect();
		resizeObserver = null;
		hexbinInstance?.dispose();
		bandInstance?.dispose();
		hexbinInstance = null;
		bandInstance = null;
	}

	function attachResizeHandling() {
		resizeObserver?.disconnect();
		if (!hexbinContainer || !bandContainer) return;

		resizeObserver = new ResizeObserver(() => {
			hexbinInstance?.resize();
			bandInstance?.resize();
		});
		resizeObserver.observe(hexbinContainer);
		resizeObserver.observe(bandContainer);
	}

	async function renderCharts() {
		if (!hexbinContainer || !bandContainer || !echartsApi) return;

		if (!data || !hasData) {
			chartError = null;
			destroyCharts();
			return;
		}

		echartsApi.getInstanceByDom(hexbinContainer)?.dispose();
		echartsApi.getInstanceByDom(bandContainer)?.dispose();
		destroyCharts();

		const isMobile = viewportWidth <= 768;
		const binnedData = buildBinnedReturnData();
		const bandData = buildBandData();
		const maxBinTvl = Math.max(...binnedData.map((point) => point.totalTvl), 0);

		hexbinInstance = echartsApi.init(hexbinContainer);
		bandInstance = echartsApi.init(bandContainer);

		hexbinInstance.setOption({
			animationDuration: 350,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				top: isMobile ? 44 : 42,
				right: isMobile ? 16 : 28,
				bottom: isMobile ? 46 : 52,
				left: isMobile ? 52 : 72,
				containLabel: false
			},
			tooltip: {
				...buildBaseTooltip(),
				formatter: (params: { data?: BinnedReturnDatum }) => (params.data ? buildBinnedTooltip(params.data) : '')
			},
			xAxis: {
				type: 'value',
				name: 'CORE3 score',
				nameLocation: 'middle',
				nameGap: 30,
				min: 0,
				max: 100,
				axisLabel: { color: '#cbd5e1', fontFamily: chartFontFamily, fontSize: isMobile ? 11 : 12 },
				nameTextStyle: { color: '#d5deea', fontFamily: chartFontFamily, fontSize: isMobile ? 11 : 12, fontWeight: 700 },
				splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.16)' } }
			},
			yAxis: {
				type: 'log',
				name: '3M annualised return',
				nameLocation: 'middle',
				nameGap: isMobile ? 38 : 52,
				min: minReturnLog,
				max: maxReturnAxisPercent,
				logBase: 10,
				axisLabel: {
					color: '#cbd5e1',
					fontFamily: chartFontFamily,
					fontSize: isMobile ? 11 : 12,
					formatter: (value: number) => (value >= 1 ? `${value.toFixed(0)}%` : `${value.toFixed(2)}%`)
				},
				nameTextStyle: { color: '#d5deea', fontFamily: chartFontFamily, fontSize: isMobile ? 11 : 12, fontWeight: 700 },
				splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.16)' } }
			},
			series: [
				{
					name: 'Hexbin density',
					type: 'scatter',
					symbol: hexagonSymbol,
					data: binnedData,
					symbolSize: (value: [number, number, number, number]) => getTvlSymbolSize(value[3], maxBinTvl),
					emphasis: {
						focus: 'self',
						itemStyle: {
							borderColor: '#f8fafc',
							borderWidth: 2,
							shadowBlur: 14,
							shadowColor: 'rgba(15, 23, 42, 0.55)'
						}
					}
				}
			]
		});

		bandInstance.setOption({
			animationDuration: 350,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				top: 26,
				right: isMobile ? 12 : 24,
				bottom: isMobile ? 54 : 48,
				left: isMobile ? 52 : 72,
				containLabel: false
			},
			tooltip: {
				...buildBaseTooltip(),
				formatter: (params: { data?: BandDatum }) => (params.data ? buildBandTooltip(params.data) : '')
			},
			xAxis: {
				type: 'category',
				data: bandData.map((band) => band.label),
				axisLabel: { color: '#cbd5e1', fontFamily: chartFontFamily, fontSize: isMobile ? 10 : 12 },
				axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.35)' } },
				axisTick: { show: false }
			},
			yAxis: {
				type: 'value',
				name: 'Stablecoin vault TVL',
				nameLocation: 'middle',
				nameGap: isMobile ? 38 : 52,
				axisLabel: {
					color: '#cbd5e1',
					fontFamily: chartFontFamily,
					fontSize: isMobile ? 11 : 12,
					formatter: (value: number) => formatUsd(value)
				},
				nameTextStyle: { color: '#d5deea', fontFamily: chartFontFamily, fontSize: isMobile ? 11 : 12, fontWeight: 700 },
				splitLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.16)' } }
			},
			series: [
				{
					name: 'TVL',
					type: 'bar',
					data: bandData,
					barMaxWidth: 54,
					label: {
						show: !isMobile,
						position: 'top',
						color: '#e2e8f0',
						fontFamily: chartFontFamily,
						fontSize: 12,
						fontWeight: 700,
						formatter: (params: { data?: BandDatum }) =>
							params.data && params.data.tvl > 0 ? formatUsd(params.data.tvl) : ''
					},
					itemStyle: {
						borderRadius: [5, 5, 0, 0]
					},
					emphasis: {
						itemStyle: {
							shadowBlur: 12,
							shadowColor: 'rgba(15, 23, 42, 0.5)'
						}
					}
				}
			]
		});

		attachResizeHandling();
		chartError = null;
	}

	onMount(() => {
		if (!browser) return;

		let disposed = false;
		const handleWindowResize = () => {
			viewportWidth = window.innerWidth;
			hexbinInstance?.resize();
			bandInstance?.resize();
		};
		viewportWidth = window.innerWidth;
		window.addEventListener('resize', handleWindowResize);

		(async () => {
			try {
				echartsApi = await loadECharts();
				if (disposed) return;

				runtimeReady = true;
				await tick();
				if (disposed) return;

				await renderCharts();
			} catch (loadError) {
				if (disposed) return;
				chartError = loadError instanceof Error ? loadError.message : 'Failed to initialise charts.';
			}
		})();

		return () => {
			disposed = true;
			window.removeEventListener('resize', handleWindowResize);
			destroyCharts();
		};
	});

	$effect(() => {
		data;
		dataLoading;
		error;
		viewportWidth;
		if (!runtimeReady || !echartsApi || !hexbinContainer || !bandContainer || dataLoading || error) return;

		let cancelled = false;
		void tick().then(async () => {
			if (cancelled) return;
			await renderCharts();
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="core3-risk-charts">
	<section class="chart-section" aria-labelledby="core3-returns-heading">
		<h2 id="core3-returns-heading">Returns by CORE3 Probability of Loss</h2>
		<div class="chart-panel">
			<ScatterPlotShell
				loading={dataLoading}
				error={effectiveError}
				showMinTvlControl={false}
				className="core3-risk-shell"
			>
				{#snippet chartContent()}
					<div bind:this={hexbinContainer} class="chart-container binned-chart"></div>
				{/snippet}
			</ScatterPlotShell>
		</div>
	</section>

	<section class="chart-section" aria-labelledby="core3-tvl-heading">
		<h2 id="core3-tvl-heading">TVL by CORE3 Probability of Loss</h2>
		<div class="chart-panel">
			<ScatterPlotShell
				loading={dataLoading}
				error={effectiveError}
				showMinTvlControl={false}
				className="core3-risk-shell"
			>
				{#snippet chartContent()}
					<div bind:this={bandContainer} class="chart-container band-chart"></div>
				{/snippet}
			</ScatterPlotShell>
		</div>
	</section>

	{#if data && !dataLoading && !effectiveError}
		<p class="coverage-note">
			CORE3 currently leaves {formatUsd(data.meta.uncoveredStablecoinTvl)} ({formatShare(
				data.meta.uncoveredStablecoinTvlShare
			)}) of eligible stablecoin vault TVL uncovered on this page.
		</p>
	{/if}
</div>

<style>
	.core3-risk-charts {
		display: grid;
		gap: clamp(1.25rem, 2.6vw, 2rem);
	}

	:global(.core3-risk-shell .chart-surface) {
		min-height: 360px;
	}

	.chart-section,
	.chart-panel {
		min-width: 0;
	}

	h2 {
		margin: 0 0 var(--space-sm);
		font: var(--f-heading-lg-medium);
		color: var(--c-text);
		letter-spacing: var(--f-heading-lg-spacing, normal);
	}

	.chart-container {
		width: 100%;
		min-height: 330px;
	}

	.binned-chart {
		min-height: 390px;
	}

	.band-chart {
		min-height: 310px;
	}

	.coverage-note {
		margin: 0.85rem auto 0;
		max-width: 58rem;
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
	}

	@media (--viewport-sm-down) {
		:global(.core3-risk-shell .chart-surface) {
			min-height: 360px;
			margin-inline: calc(-1 * var(--space-md));
			width: calc(100% + (2 * var(--space-md)));
		}

		h2 {
			font: var(--f-heading-md-medium);
			letter-spacing: var(--f-heading-md-spacing, normal);
		}

		.chart-container,
		.binned-chart,
		.band-chart {
			min-height: 330px;
		}
	}
</style>

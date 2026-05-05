<!--
@component
Compact dual-axis chart for vault group detail pages.

Shows historical protocol TVL as an area series and TVL-weighted one-month
average TVL-weighted return as a line series.

@example

```svelte
	<VaultGroupMiniChart title="All Spark vaults" dataUrl="/trading-view/vaults/protocols/spark/chart-data" />
```
-->
<script lang="ts">
	import { base } from '$app/paths';
	import Spinner from '$lib/components/Spinner.svelte';
	import { formatRate, formatUsd } from '$lib/echarts/cumulative-tvl-apy';
	import type { ProtocolMiniChartPayload } from '$lib/echarts/protocol-mini-chart';
	import { type EChartsStatic, loadECharts } from '$lib/echarts/runtime';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import { onMount, tick } from 'svelte';

	interface Props {
		title: string;
		dataUrl: string;
		compareLabel?: string;
		compareHref?: string;
	}

	interface TooltipParam {
		axisValueLabel?: string;
		seriesName?: string;
		data?: number | null;
		color?: string;
	}

	let { title, dataUrl, compareLabel, compareHref }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chartInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let resizeObserver = $state<ResizeObserver | null>(null);
	let runtimeReady = $state(false);
	let dataLoading = $state(true);
	let chartData = $state<ProtocolMiniChartPayload | null>(null);
	let chartError = $state<string | null>(null);
	let loadedDataUrl = $state<string | null>(null);

	const tvlColour = '#14b8a6';
	const returnColour = '#f59e0b';
	const axisTextColour = '#d5deea';
	const gridColour = 'rgba(148, 163, 184, 0.18)';

	let points = $derived(chartData?.points ?? []);
	let hasPoints = $derived(points.length > 0);

	function formatDateLabel(value: string) {
		const date = new Date(`${value}T00:00:00Z`);
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function formatAxisDate(value: string) {
		const date = new Date(`${value}T00:00:00Z`);
		return new Intl.DateTimeFormat('en-GB', {
			month: 'short',
			year: '2-digit'
		}).format(date);
	}

	function formatReturn(value: number | null | undefined) {
		return formatRate(value == null ? null : value * 100, 1);
	}

	function withAlpha(colour: string, alpha: number) {
		const hex = colour.replace('#', '');
		const red = Number.parseInt(hex.slice(0, 2), 16);
		const green = Number.parseInt(hex.slice(2, 4), 16);
		const blue = Number.parseInt(hex.slice(4, 6), 16);
		return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
	}

	function resolveDataUrl(url: string) {
		if (/^https?:\/\//.test(url)) return url;
		return `${base}${url}`;
	}

	function resolveHref(url: string) {
		if (/^https?:\/\//.test(url)) return url;
		return `${base}${url}`;
	}

	function buildTooltip(params: TooltipParam[]) {
		const date = params[0]?.axisValueLabel ?? '';
		const tvl = params.find((param) => param.seriesName === 'TVL')?.data;
		const averageReturn = params.find((param) => param.seriesName === 'Average TVL-weighted return')?.data;

		return [
			`<div style="margin-bottom: 0.35rem; color: #ffffff; font-family: ${chartFontFamily}; font-weight: 700;">${formatDateLabel(date)}</div>`,
			`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>Total TVL across all vaults</span><strong>${typeof tvl === 'number' ? formatUsd(tvl) : 'n/a'}</strong></div>`,
			`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>Average TVL-weighted return</span><strong>${typeof averageReturn === 'number' ? formatReturn(averageReturn) : 'n/a'}</strong></div>`,
			`<div style="width: 14rem; max-width: 14rem; white-space: normal; overflow-wrap: anywhere; margin-top: 0.45rem; color: #94a3b8; font-family: ${chartFontFamily}; font-size: 0.78rem; line-height: 1.35;">Return is annualised from each vault's trailing 1 month share-price return, weighted by that vault's TVL.</div>`
		].join('');
	}

	function destroyChart() {
		resizeObserver?.disconnect();
		resizeObserver = null;
		chartInstance?.dispose();
		chartInstance = null;
	}

	function attachResizeHandling() {
		resizeObserver?.disconnect();
		if (!chartContainer || !chartInstance) return;

		resizeObserver = new ResizeObserver(() => chartInstance?.resize());
		resizeObserver.observe(chartContainer);
	}

	function renderChart() {
		if (!chartContainer || !echartsApi || !hasPoints) return;

		const existingInstance = echartsApi.getInstanceByDom(chartContainer);
		existingInstance?.dispose();
		destroyChart();

		const dates = points.map((point) => point.date);
		const tvlSeries = points.map((point) => point.tvl);
		const returnSeries = points.map((point) => point.apy);

		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 300,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			color: [tvlColour, returnColour],
			grid: {
				top: 8,
				right: 8,
				bottom: 28,
				left: 8,
				containLabel: true
			},
			legend: {
				show: false
			},
			tooltip: {
				trigger: 'axis',
				appendToBody: true,
				axisPointer: {
					type: 'line',
					lineStyle: { color: 'rgba(248, 250, 252, 0.35)' }
				},
				backgroundColor: '#111827',
				borderColor: '#1f2937',
				borderWidth: 1,
				confine: true,
				padding: 10,
				textStyle: {
					color: '#f8fafc',
					fontFamily: chartFontFamily,
					fontSize: 12,
					lineHeight: 18
				},
				formatter: (params: TooltipParam[]) => buildTooltip(params)
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: dates,
				axisLine: { lineStyle: { color: 'rgba(148, 163, 184, 0.4)' } },
				axisTick: { show: true, alignWithLabel: true, lineStyle: { color: 'rgba(148, 163, 184, 0.35)' } },
				axisLabel: {
					color: axisTextColour,
					fontFamily: chartFontFamily,
					fontSize: 10,
					hideOverlap: true,
					margin: 8,
					formatter: (value: string) => formatAxisDate(value)
				},
				splitLine: { show: false }
			},
			yAxis: [
				{
					type: 'value',
					min: 0,
					axisLine: { show: true, lineStyle: { color: withAlpha(tvlColour, 0.65) } },
					axisTick: { show: true, lineStyle: { color: withAlpha(tvlColour, 0.45) } },
					axisLabel: {
						color: axisTextColour,
						fontFamily: chartFontFamily,
						fontSize: 10,
						formatter: (value: number) => formatUsd(value)
					},
					splitLine: { lineStyle: { color: gridColour } }
				},
				{
					type: 'value',
					position: 'right',
					axisLine: { show: true, lineStyle: { color: withAlpha(returnColour, 0.75) } },
					axisTick: { show: true, lineStyle: { color: withAlpha(returnColour, 0.48) } },
					axisLabel: {
						color: axisTextColour,
						fontFamily: chartFontFamily,
						fontSize: 10,
						formatter: (value: number) => formatReturn(value)
					},
					splitLine: { show: false }
				}
			],
			series: [
				{
					name: 'TVL',
					type: 'line',
					yAxisIndex: 0,
					showSymbol: false,
					symbol: 'circle',
					symbolSize: 4,
					lineStyle: { width: 1.5, color: tvlColour },
					itemStyle: { color: tvlColour },
					areaStyle: {
						opacity: 1,
						color: new echartsApi.graphic.LinearGradient(0, 0, 0, 1, [
							{ offset: 0, color: withAlpha(tvlColour, 0.36) },
							{ offset: 1, color: withAlpha(tvlColour, 0.04) }
						])
					},
					data: tvlSeries
				},
				{
					name: 'Average TVL-weighted return',
					type: 'line',
					yAxisIndex: 1,
					showSymbol: false,
					connectNulls: true,
					symbol: 'circle',
					symbolSize: 4,
					lineStyle: { width: 2, color: returnColour },
					itemStyle: { color: returnColour },
					data: returnSeries
				}
			]
		});

		attachResizeHandling();
	}

	async function fetchChartData(url: string) {
		dataLoading = true;
		chartError = null;

		try {
			const response = await fetch(resolveDataUrl(url), { cache: 'no-store' });
			if (!response.ok) throw new Error('Failed to load protocol chart data.');
			chartData = (await response.json()) as ProtocolMiniChartPayload;
			loadedDataUrl = url;
		} catch (error) {
			chartError = error instanceof Error ? error.message : 'Failed to load protocol chart data.';
		} finally {
			dataLoading = false;
		}
	}

	onMount(() => {
		let disposed = false;

		(async () => {
			try {
				const [api] = await Promise.all([loadECharts(), fetchChartData(dataUrl)]);
				if (disposed) return;

				echartsApi = api;
				runtimeReady = true;
				await tick();
				if (disposed) return;

				renderChart();
			} catch (error) {
				if (disposed) return;
				chartError = error instanceof Error ? error.message : 'Failed to initialise protocol chart.';
				dataLoading = false;
			}
		})();

		return () => {
			disposed = true;
			destroyChart();
		};
	});

	$effect(() => {
		dataUrl;
		if (runtimeReady && loadedDataUrl !== dataUrl) void fetchChartData(dataUrl);
	});

	$effect(() => {
		chartData;
		dataLoading;
		chartError;
		if (!runtimeReady || !echartsApi || !chartContainer || dataLoading || chartError || !hasPoints) return;

		let cancelled = false;
		void tick().then(() => {
			if (!cancelled) renderChart();
		});

		return () => {
			cancelled = true;
		};
	});
</script>

<div class="protocol-mini-chart" data-testid="vault-group-mini-chart">
	<header>
		<div>
			<p>{title}</p>
		</div>
	</header>

	<div class="chart-surface">
		{#if dataLoading}
			<div class="chart-state">
				<Spinner />
			</div>
		{:else if chartError}
			<div class="chart-state">
				<p>{chartError}</p>
			</div>
		{:else if !hasPoints}
			<div class="chart-state">
				<p>No chart data available.</p>
			</div>
		{:else}
			<div bind:this={chartContainer} class="chart-canvas"></div>
		{/if}
	</div>

	{#if compareLabel && compareHref}
		<a class="compare-link" href={resolveHref(compareHref)}>{compareLabel}</a>
	{/if}
</div>

<style>
	.protocol-mini-chart {
		display: grid;
		gap: 0.5rem;
		min-height: 17rem;
		padding: 0.875rem;
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 14%);
		border-radius: var(--radius-md);
		background:
			linear-gradient(180deg, color-mix(in srgb, var(--c-box-2), transparent 6%), var(--c-box-1)), var(--c-box-1);
		box-shadow: var(--shadow-sm);
	}

	header {
		display: flex;
		align-items: start;
		justify-content: space-between;
		gap: 0.75rem;

		p {
			margin: 0;
			color: var(--c-text);
			font: var(--f-ui-sm-medium);
		}
	}

	.chart-surface {
		position: relative;
		min-height: 12.5rem;
	}

	.chart-canvas,
	.chart-state {
		position: absolute;
		inset: 0;
	}

	.chart-state {
		display: grid;
		place-items: center;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
		text-align: center;
	}

	.compare-link {
		justify-self: center;
		color: var(--c-link);
		font: var(--f-ui-sm-medium);
		text-align: center;
		text-decoration: underline;
		text-underline-offset: 0.2em;

		&:hover {
			text-decoration-thickness: 0.12em;
		}
	}

	@media (--viewport-sm-down) {
		.protocol-mini-chart {
			min-height: 15.5rem;
		}

		.chart-surface {
			min-height: 11.5rem;
		}
	}
</style>

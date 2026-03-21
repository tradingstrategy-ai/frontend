<!--
@component
Reusable client-side ECharts stacked area chart for historical vault TVL groupings.

@example

```svelte
	<HistoricalTvlGroupChart
		data={chartData}
		searchParamKey="chains"
		selectorLabel="Chain"
		selectorLabelPlural="chains"
	/>
```
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { removeOnError } from '$lib/actions/image';
	import Spinner from '$lib/components/Spinner.svelte';
	import { formatUsd } from '$lib/echarts/cumulative-tvl-apy';
	import { type HistoricalTvlPayload, type HistoricalTvlSeriesBase } from '$lib/echarts/historical-tvl';
	import { type EChartsStatic, loadECharts } from '$lib/echarts/runtime';
	import { type ParamSchema, deserialiseSearchParams, serialiseSearchParams } from '$lib/helpers/url-search-state';
	import { chartFontFamily, protocolPalette } from '$lib/scatter-plot/helpers';
	import { onMount, tick } from 'svelte';

	interface Props {
		data: HistoricalTvlPayload | null;
		dataLoading?: boolean;
		error?: string | null;
		searchParamKey: string;
		selectorLabel: string;
		selectorLabelPlural: string;
		getSeriesLogoUrl?: ((series: HistoricalTvlSeriesBase) => string | undefined) | undefined;
	}

	let {
		data,
		dataLoading = false,
		error = null,
		searchParamKey,
		selectorLabel,
		selectorLabelPlural,
		getSeriesLogoUrl
	}: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chartInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let resizeObserver = $state<ResizeObserver | null>(null);
	let runtimeReady = $state(false);
	let chartError = $state<string | null>(null);

	const maxTooltipSeries = 10;
	const axisFontStack = chartFontFamily;
	const axisTitleFontSize = 16;
	const axisLabelFontSize = 13;
	const tooltipFontSize = 14;
	const gridDesktop = { top: 36, right: 88, bottom: 84, left: 52 };
	const gridMobile = { top: 28, right: 24, bottom: 72, left: 18 };

	function getSearchParamsSchema() {
		return {
			[searchParamKey]: { type: 'string', defaultValue: '' }
		} as ParamSchema;
	}

	let urlState = $derived(
		deserialiseSearchParams(page.url.searchParams, getSearchParamsSchema()) as Record<string, string>
	);
	let selectedParamValue = $derived(urlState[searchParamKey] ?? '');
	let effectiveError = $derived(error ?? chartError);
	let hasSeries = $derived((data?.series.length ?? 0) > 0);
	let selectedSeriesKeys = $derived(selectedParamValue ? selectedParamValue.split(',').filter(Boolean) : []);
	let visibleSeries = $derived(
		data?.series.filter((item) => selectedSeriesKeys.length === 0 || selectedSeriesKeys.includes(item.key)) ?? []
	);
	let latestSelectedTvl = $derived(visibleSeries.reduce((sum, item) => sum + (item.values.at(-1) ?? 0), 0));

	function formatWeekLabel(value: string) {
		const date = new Date(`${value}T00:00:00Z`);
		return new Intl.DateTimeFormat('en-GB', {
			month: 'short',
			year: 'numeric'
		}).format(date);
	}

	function withAlpha(colour: string, alpha: number) {
		const normalized = colour.trim();
		if (/^#([0-9a-f]{6})$/i.test(normalized)) {
			const hex = normalized.slice(1);
			const red = Number.parseInt(hex.slice(0, 2), 16);
			const green = Number.parseInt(hex.slice(2, 4), 16);
			const blue = Number.parseInt(hex.slice(4, 6), 16);
			return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
		}

		return normalized;
	}

	function getSeriesColour(index: number) {
		return protocolPalette[index % protocolPalette.length];
	}

	function updateUrl(overrides: Record<string, string>) {
		const schema = getSearchParamsSchema();
		const current = deserialiseSearchParams(page.url.searchParams, schema) as Record<string, string>;
		const updated = { ...current, ...overrides };
		const qs = serialiseSearchParams(updated, schema);
		const href = qs ? `${page.url.pathname}?${qs}` : page.url.pathname;
		// eslint-disable-next-line svelte/no-navigation-without-resolve
		goto(href, { replaceState: true, noScroll: true, keepFocus: true });
	}

	function isSeriesSelected(key: string) {
		return selectedSeriesKeys.length === 0 || selectedSeriesKeys.includes(key);
	}

	function toggleSeries(key: string) {
		if (!data) return;

		const allKeys = data.series.map((item) => item.key);

		if (selectedSeriesKeys.length === 0) {
			updateUrl({ [searchParamKey]: key });
			return;
		}

		if (selectedSeriesKeys.includes(key)) {
			if (selectedSeriesKeys.length <= 1) {
				updateUrl({ [searchParamKey]: '' });
			} else {
				updateUrl({ [searchParamKey]: selectedSeriesKeys.filter((itemKey) => itemKey !== key).join(',') });
			}
			return;
		}

		const next = allKeys.filter((itemKey) => [...selectedSeriesKeys, key].includes(itemKey));
		updateUrl({ [searchParamKey]: next.length === allKeys.length ? '' : next.join(',') });
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

	function buildTooltip(
		params: Array<{ axisValueLabel?: string; seriesName?: string; value?: number; color?: string }>
	) {
		const sorted = [...params].sort((left, right) => (right.value ?? 0) - (left.value ?? 0));
		const total = sorted.reduce((sum, item) => sum + (item.value ?? 0), 0);
		const visible = sorted.filter((item) => (item.value ?? 0) > 0).slice(0, maxTooltipSeries);
		const hiddenCount = sorted.filter((item) => (item.value ?? 0) > 0).length - visible.length;
		const hiddenLabel = hiddenCount === 1 ? selectorLabel.toLowerCase() : selectorLabelPlural.toLowerCase();

		return [
			`<div style="margin-bottom: 0.4rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1rem; font-weight: 700;">${params[0]?.axisValueLabel ?? ''}</div>`,
			`<div style="margin-bottom: 0.5rem; color: #d5deea; font-family: ${chartFontFamily};"><strong>Total TVL:</strong> ${formatUsd(total)}</div>`,
			...visible.map((item, index) => {
				const value = item.value ?? 0;
				const share = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
				const colour = typeof item.color === 'string' ? item.color : '#94a3b8';
				return `<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span style="display: inline-flex; align-items: center; gap: 0.45rem;"><span style="width: 0.72rem; height: 0.72rem; border-radius: 999px; background: ${colour}; box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);"></span><span>${index + 1}. ${item.seriesName}</span></span><strong>${formatUsd(value)} (${share}%)</strong></div>`;
			}),
			...(hiddenCount > 0
				? [
						`<div style="margin-top: 0.45rem; color: #94a3b8; font-family: ${chartFontFamily};">+${hiddenCount} more ${hiddenLabel}</div>`
					]
				: [])
		].join('');
	}

	async function renderChart() {
		if (!chartContainer || !echartsApi) return;

		if (!data || visibleSeries.length === 0) {
			chartError = 'No historical vault TVL data available.';
			destroyChart();
			return;
		}

		const existingInstance = echartsApi.getInstanceByDom(chartContainer);
		existingInstance?.dispose();
		destroyChart();

		const isMobile = window.innerWidth <= 768;
		const grid = isMobile ? gridMobile : gridDesktop;
		const series = visibleSeries.map((item, index) => {
			const colour = getSeriesColour(index);
			return {
				name: item.label,
				type: 'line',
				stack: 'vault-tvl',
				smooth: false,
				showSymbol: false,
				symbol: 'circle',
				symbolSize: 5,
				lineStyle: {
					width: 0,
					opacity: 0,
					color: colour
				},
				itemStyle: {
					color: colour
				},
				areaStyle: {
					color: withAlpha(colour, 0.56),
					opacity: 1
				},
				emphasis: {
					focus: 'series'
				},
				data: item.values
			};
		});

		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 350,
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
				padding: 12,
				textStyle: {
					color: '#f8fafc',
					fontFamily: chartFontFamily,
					fontSize: tooltipFontSize,
					lineHeight: 20
				},
				formatter: (params: Array<{ axisValueLabel?: string; seriesName?: string; value?: number; color?: string }>) =>
					buildTooltip(params)
			},
			xAxis: {
				type: 'category',
				boundaryGap: false,
				data: data.weeks,
				axisLine: { lineStyle: { color: '#64748b' } },
				axisLabel: {
					color: '#e2e8f0',
					fontFamily: axisFontStack,
					fontSize: axisLabelFontSize,
					fontWeight: 600,
					formatter: (value: string) => formatWeekLabel(value)
				},
				splitLine: { show: false }
			},
			yAxis: {
				type: 'value',
				name: isMobile ? '' : 'TVL',
				nameLocation: 'end',
				nameGap: 16,
				position: 'right',
				nameTextStyle: {
					color: '#ffffff',
					fontFamily: axisFontStack,
					fontSize: axisTitleFontSize,
					fontWeight: 600
				},
				axisLine: { lineStyle: { color: '#64748b' } },
				axisLabel: {
					color: '#e2e8f0',
					fontFamily: axisFontStack,
					fontSize: axisLabelFontSize,
					fontWeight: 600,
					formatter: (value: number) => formatUsd(value)
				},
				splitLine: {
					lineStyle: { color: 'rgba(148, 163, 184, 0.18)' }
				}
			},
			series
		});

		attachResizeHandling();
		chartError = null;
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
				chartError = loadError instanceof Error ? loadError.message : 'Failed to initialise chart.';
			}
		})();

		return () => {
			disposed = true;
			window.removeEventListener('resize', handleWindowResize);
			destroyChart();
		};
	});

	$effect(() => {
		data;
		dataLoading;
		error;
		urlState;
		if (!runtimeReady || !echartsApi || !chartContainer || dataLoading || error) return;

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

<div class="historical-tvl-group-chart standalone-historical-tvl-shell" data-testid="vault-scatter-plot">
	<div class="chart-surface">
		{#if dataLoading}
			<div class="chart-state">
				<Spinner />
				<p>Loading historical vault TVL by {selectorLabelPlural.toLowerCase()}…</p>
			</div>
		{:else if effectiveError}
			<div class="chart-state">
				<p>{effectiveError}</p>
			</div>
		{:else if !hasSeries}
			<div class="chart-state">
				<p>No historical vault TVL data available.</p>
			</div>
		{:else}
			<div bind:this={chartContainer} class="chart-canvas"></div>
		{/if}
	</div>

	{#if data && !dataLoading && !effectiveError && visibleSeries.length > 0}
		<p class="chart-summary">
			Today selected {selectorLabelPlural.toLowerCase()} have total {formatUsd(latestSelectedTvl)} TVL
		</p>
	{/if}

	{#if data && !dataLoading && !effectiveError && hasSeries}
		<div class="group-selector" aria-label={`${selectorLabel} selector`}>
			{#each data.series as item, index (item.key)}
				<button
					type="button"
					class="group-chip"
					class:active={isSeriesSelected(item.key)}
					onclick={() => toggleSeries(item.key)}
				>
					{#if getSeriesLogoUrl?.(item)}
						<img class="group-chip-logo" src={getSeriesLogoUrl(item)} alt="" loading="lazy" use:removeOnError />
					{:else}
						<span class="group-chip-logo group-chip-logo-fallback" aria-hidden="true"></span>
					{/if}
					<span class="group-chip-label">{item.label}</span>
					<span class="group-chip-dot" aria-hidden="true" style={`background: ${getSeriesColour(index)};`}></span>
				</button>
			{/each}
		</div>
	{/if}
</div>

<style>
	.historical-tvl-group-chart {
		--chart-height-desktop: 620px;
		--chart-height-mobile: 560px;
		display: grid;
		gap: 0.85rem;
		position: relative;
		width: 100%;
	}

	.group-selector {
		display: flex;
		flex-wrap: wrap;
		gap: 0.5rem 0.625rem;
		align-items: center;
	}

	.group-chip {
		display: inline-flex;
		align-items: center;
		gap: 0.45rem;
		padding: 0.38rem 0.7rem;
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 18%);
		border-radius: 999px;
		background: color-mix(in srgb, var(--c-box-2), var(--c-text-inverted) 78%);
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-medium);
		cursor: pointer;
		transition:
			background 0.15s ease,
			border-color 0.15s ease,
			opacity 0.15s ease;
		opacity: 0.72;

		&.active {
			opacity: 1;
			color: var(--c-text);
			border-color: color-mix(in srgb, var(--c-text-light), transparent 48%);
			background: color-mix(in srgb, var(--c-box-3), var(--c-text-inverted) 78%);
		}
	}

	.group-chip-logo {
		width: 1rem;
		height: 1rem;
		border-radius: 999px;
		object-fit: contain;
		flex: 0 0 auto;
	}

	.group-chip-logo-fallback {
		display: inline-block;
		background: color-mix(in srgb, var(--c-text-ultra-light), var(--c-box-3) 55%);
		box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 82%);
	}

	.group-chip-label {
		line-height: 1.1;
	}

	.group-chip-dot {
		width: 0.72rem;
		height: 0.72rem;
		border-radius: 999px;
		flex: 0 0 auto;
		box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.18);
	}

	.chart-surface {
		position: relative;
		min-height: var(--chart-height-desktop);
		padding: clamp(0.75rem, 1.8vw, 1rem);
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 14%);
		border-radius: var(--radius-lg);
		background:
			linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-box-1), transparent 60%),
				color-mix(in srgb, var(--c-box-2), var(--c-text-inverted) 76%)
			),
			radial-gradient(circle at top left, color-mix(in srgb, var(--c-bullish), transparent 90%) 0%, transparent 20%),
			linear-gradient(145deg, color-mix(in srgb, var(--c-text-light), transparent 96%), transparent 20%),
			color-mix(in srgb, var(--c-box-1), var(--c-text-inverted) 18%);
		overflow: hidden;
		isolation: isolate;
		box-shadow:
			0 1.5rem 3rem color-mix(in srgb, var(--c-text-inverted), transparent 82%),
			inset 0 1px 0 color-mix(in srgb, var(--c-text-light), transparent 78%),
			inset 0 0 0 1px color-mix(in srgb, var(--c-text-light), transparent 94%);

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
				color-mix(in srgb, var(--c-text-light), transparent 90%) 0%,
				transparent 52%
			);
			opacity: 0.58;
		}

		&::after {
			background: linear-gradient(
				180deg,
				color-mix(in srgb, var(--c-text-inverted), transparent 94%) 0%,
				transparent 24%,
				color-mix(in srgb, var(--c-text-inverted), transparent 90%) 100%
			);
			opacity: 0.92;
		}
	}

	.chart-canvas {
		height: var(--chart-height-desktop);
		width: 100%;
		position: relative;
		z-index: 0;
	}

	.chart-state {
		height: var(--chart-height-desktop);
		display: grid;
		place-items: center;
		text-align: center;
		gap: 0.75rem;
		color: var(--c-text-extra-light);
		font: var(--f-body-md-regular);
	}

	.chart-summary {
		margin: 0;
		color: var(--c-text-light);
		font: var(--f-body-sm-medium);
		text-align: center;
	}

	@media (--viewport-sm-down) {
		.chart-surface {
			min-height: var(--chart-height-mobile);
			padding: 0;
			border: 0;
			border-radius: 0;
			background: transparent;
			box-shadow: none;

			&::before,
			&::after {
				display: none;
			}
		}

		.chart-canvas,
		.chart-state {
			height: var(--chart-height-mobile);
		}
	}
</style>

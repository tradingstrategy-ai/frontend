<!--
@component
Client-side ECharts renderer for position entry and exit charts.

@example

```svelte
	<PositionChartsECharts data={positionChartData} />
```
-->
<script lang="ts">
	import { onMount, tick } from 'svelte';
	import SummaryBox from '$lib/components/SummaryBox.svelte';
	import { type EChartsStatic, loadECharts } from '$lib/echarts/runtime';
	import { formatPrice, formatTokenAmount } from '$lib/helpers/formatters';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import {
		buildPositionChartsModel,
		type PositionChartMarker,
		type PositionChartSeries
	} from 'trade-executor/helpers/position-chart';
	import type { PositionChart } from 'trade-executor/schemas/position-chart';

	type Props = {
		data: PositionChart;
		tradePathBase: string;
	};

	type TooltipParam = {
		axisValue?: number;
		data?: { value?: [number, number]; trade?: PositionChartMarker } | [number, number];
		seriesType?: string;
		seriesName?: string;
		value?: [number, number];
	};

	let { data, tradePathBase }: Props = $props();

	let underlyingContainer = $state<HTMLDivElement | null>(null);
	let internalContainer = $state<HTMLDivElement | null>(null);
	let underlyingChart = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let internalChart = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let chartError = $state<string | null>(null);
	let model = $derived(buildPositionChartsModel(data, tradePathBase));

	const increaseColour = '#22c55e';
	const decreaseColour = '#ef4444';
	const underlyingLineColour = '#60a5fa';
	const internalLineColour = '#f59e0b';

	function formatAxisDate(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			day: 'numeric',
			month: 'short'
		}).format(new Date(timestamp));
	}

	function formatTooltipDate(timestamp: number) {
		return new Intl.DateTimeFormat('en-GB', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(timestamp));
	}

	function buildTooltip(seriesLabel: string, params: TooltipParam | TooltipParam[]) {
		const items = Array.isArray(params) ? params : [params];
		const axisTimestamp =
			items.find((item) => typeof item.axisValue === 'number')?.axisValue ??
			getMarkerFromTooltipItem(items.find((item) => item.seriesType === 'scatter'))?.timestamp;

		const linePoint = items.find((item) => item.seriesType === 'line');
		const lineValue = Array.isArray(linePoint?.value)
			? linePoint?.value?.[1]
			: Array.isArray(linePoint?.data)
				? linePoint.data[1]
				: linePoint?.data?.value?.[1];
		const tradeMarkers = items
			.map((item) => getMarkerFromTooltipItem(item))
			.filter((marker): marker is PositionChartMarker => Boolean(marker));

		const lines = [
			`<div style="margin-bottom: 0.35rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1rem; font-weight: 700;">${axisTimestamp ? formatTooltipDate(axisTimestamp) : ''}</div>`
		];

		if (typeof lineValue === 'number') {
			lines.push(
				`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>${seriesLabel}</span><strong>${formatPrice(lineValue, 2, 6)}</strong></div>`
			);
		}

		for (const marker of tradeMarkers) {
			const quantity = marker.quantity == null ? 'n/a' : formatTokenAmount(Math.abs(marker.quantity), 2, 6);
			const price = marker.price == null ? 'n/a' : formatPrice(marker.price, 2, 6);
			const tradeValue = formatPrice(marker.tradeValueUsd, 2, 6);
			const colour = marker.kind === 'increase' ? increaseColour : decreaseColour;

			lines.push(
				`<div style="margin-top: 0.45rem; border-top: 1px solid rgba(148, 163, 184, 0.25); padding-top: 0.45rem; color: #d5deea; font-family: ${chartFontFamily};">` +
					`<div style="display: flex; align-items: center; gap: 0.45rem; color: #ffffff; font-weight: 600;">` +
					`<span style="width: 0; height: 0; border-left: 0.45rem solid transparent; border-right: 0.45rem solid transparent; border-bottom: ${marker.kind === 'increase' ? `0.8rem solid ${colour}` : 'none'}; border-top: ${marker.kind === 'decrease' ? `0.8rem solid ${colour}` : 'none'};"></span>` +
					`<span>${marker.directionLabel} position</span>` +
					`</div>` +
					`<div>Direction: ${marker.directionLabel}</div>` +
					`<div>Trade #${marker.tradeId}</div>` +
					`<div>Trade Value USD: ${tradeValue}</div>` +
					`<div>Quantity: ${quantity}</div>` +
					`<div>Price: ${price}</div>` +
					`<div style="margin-top: 0.35rem;"><a href="${marker.tradeUrl}" style="color: #f8fafc; text-decoration: underline; font-weight: 600;">Click more</a></div>` +
					`</div>`
			);
		}

		return lines.join('');
	}

	function getMarkerFromTooltipItem(item: TooltipParam | undefined) {
		if (!item || Array.isArray(item.data)) return null;
		return item.data?.trade ?? null;
	}

	function buildChartOption(title: string, lineColour: string, seriesLabel: string, series: PositionChartSeries) {
		const increaseMarkers = series.markers
			.filter((marker) => marker.kind === 'increase')
			.map((marker) => ({ value: [marker.timestamp, marker.value], trade: marker }));
		const decreaseMarkers = series.markers
			.filter((marker) => marker.kind === 'decrease')
			.map((marker) => ({ value: [marker.timestamp, marker.value], trade: marker }));

		return {
			animationDuration: 350,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				top: 48,
				right: 20,
				bottom: 42,
				left: 64,
				containLabel: false
			},
			tooltip: {
				trigger: 'axis',
				appendToBody: true,
				enterable: true,
				backgroundColor: '#111827',
				borderColor: '#1f2937',
				borderWidth: 1,
				padding: 12,
				textStyle: {
					color: '#f8fafc',
					fontFamily: chartFontFamily,
					fontSize: 14,
					lineHeight: 20
				},
				formatter: (params: TooltipParam | TooltipParam[]) => buildTooltip(seriesLabel, params),
				axisPointer: {
					type: 'line',
					lineStyle: {
						color: 'rgba(148, 163, 184, 0.45)'
					}
				}
			},
			xAxis: {
				type: 'time',
				axisLine: {
					lineStyle: { color: 'rgba(148, 163, 184, 0.3)' }
				},
				axisTick: { show: false },
				axisLabel: {
					color: 'rgba(255, 255, 255, 0.82)',
					fontFamily: chartFontFamily,
					fontSize: 12,
					formatter: (value: number) => formatAxisDate(value)
				},
				splitLine: {
					lineStyle: { color: 'rgba(148, 163, 184, 0.08)' }
				}
			},
			yAxis: {
				type: 'value',
				name: title,
				nameTextStyle: {
					color: 'rgba(255, 255, 255, 0.82)',
					fontFamily: chartFontFamily,
					fontSize: 12,
					padding: [0, 0, 10, 0]
				},
				axisLine: { show: false },
				axisTick: { show: false },
				axisLabel: {
					color: 'rgba(255, 255, 255, 0.82)',
					fontFamily: chartFontFamily,
					fontSize: 12,
					formatter: (value: number) => formatPrice(value, 2, 6)
				},
				splitLine: {
					lineStyle: { color: 'rgba(148, 163, 184, 0.08)' }
				}
			},
			series: [
				{
					name: seriesLabel,
					type: 'line',
					showSymbol: false,
					smooth: false,
					data: series.points.map((point) => [point.timestamp, point.value]),
					lineStyle: {
						color: lineColour,
						width: 2
					},
					itemStyle: {
						color: lineColour
					}
				},
				{
					name: 'Increase',
					type: 'scatter',
					data: increaseMarkers,
					symbol: 'triangle',
					symbolSize: 14,
					itemStyle: {
						color: increaseColour
					},
					emphasis: {
						scale: 1.15
					}
				},
				{
					name: 'Decrease',
					type: 'scatter',
					data: decreaseMarkers,
					symbol: 'triangle',
					symbolRotate: 180,
					symbolSize: 14,
					itemStyle: {
						color: decreaseColour
					},
					emphasis: {
						scale: 1.15
					}
				}
			]
		};
	}

	function renderChart(
		container: HTMLDivElement | null,
		existingChart: ReturnType<EChartsStatic['init']> | null,
		title: string,
		lineColour: string,
		seriesLabel: string,
		series: PositionChartSeries
	) {
		if (!container || !echartsApi || series.points.length === 0) {
			existingChart?.dispose();
			return null;
		}

		const reusedChart = echartsApi.getInstanceByDom(container);
		reusedChart?.dispose();
		existingChart?.dispose();

		const chart = echartsApi.init(container);
		chart.setOption(buildChartOption(title, lineColour, seriesLabel, series));
		return chart;
	}

	function resizeCharts() {
		underlyingChart?.resize();
		internalChart?.resize();
	}

	async function renderCharts() {
		await tick();

		underlyingChart = renderChart(
			underlyingContainer,
			underlyingChart,
			'Underlying price',
			underlyingLineColour,
			'Underlying price',
			model.underlyingPrice
		);
		internalChart = renderChart(
			internalContainer,
			internalChart,
			'Internal share price',
			internalLineColour,
			'Internal share price',
			model.internalSharePrice
		);
	}

	onMount(() => {
		let mounted = true;

		async function initialiseCharts() {
			try {
				echartsApi = await loadECharts();
				if (!mounted) return;
				chartError = null;
				await renderCharts();
			} catch (error) {
				if (!mounted) return;
				console.error('Failed to initialise position charts:', error);
				chartError = 'Position charts failed to load.';
			}
		}

		void initialiseCharts();
		window.addEventListener('resize', resizeCharts);

		return () => {
			mounted = false;
			window.removeEventListener('resize', resizeCharts);
			underlyingChart?.dispose();
			internalChart?.dispose();
		};
	});

	$effect(() => {
		if (!echartsApi || chartError) return;
		void renderCharts();
	});
</script>

<div class="position-charts-grid">
	<SummaryBox
		title="Underlying price"
		subtitle="Underlying asset price with increase and decrease markers."
		class="position-chart-card"
	>
		{#if chartError}
			<p class="chart-unavailable">{chartError}</p>
		{:else if model.underlyingPrice.points.length > 0}
			<div class="chart-canvas" bind:this={underlyingContainer} data-testid="underlying-position-chart"></div>
		{:else}
			<p class="chart-unavailable">{model.underlyingPrice.unavailableMessage}</p>
		{/if}
	</SummaryBox>

	<SummaryBox
		title="Internal share price"
		subtitle="Internal share price with increase and decrease markers."
		class="position-chart-card"
	>
		{#if chartError}
			<p class="chart-unavailable">{chartError}</p>
		{:else if model.internalSharePrice.points.length > 0}
			<div class="chart-canvas" bind:this={internalContainer} data-testid="internal-position-chart"></div>
		{:else}
			<p class="chart-unavailable">{model.internalSharePrice.unavailableMessage}</p>
		{/if}
	</SummaryBox>
</div>

<style>
	.position-charts-grid {
		display: grid;
		gap: 1rem;
	}

	:global(.position-chart-card .main) {
		gap: 0;
	}

	.chart-canvas {
		height: 20rem;
		width: 100%;

		@media (--viewport-sm-down) {
			height: 16rem;
		}
	}

	.chart-unavailable {
		min-height: 10rem;
		display: flex;
		align-items: center;
		justify-content: center;
		text-align: center;
		color: var(--c-text-extra-light);
		font: var(--f-ui-md-medium);
		letter-spacing: var(--ls-ui-md);
	}
</style>

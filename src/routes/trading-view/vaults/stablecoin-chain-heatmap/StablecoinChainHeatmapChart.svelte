<!--
@component
Client-side ECharts heatmap for current vault TVL by stablecoin and chain.

@example

```svelte
	<StablecoinChainHeatmapChart data={chartData} dataLoading={loading} error={error} />
```
-->
<script lang="ts">
	import { formatRate, formatUsd } from '$lib/echarts/cumulative-tvl-apy';
	import { type EChartsStatic, loadECharts } from '$lib/echarts/runtime';
	import type { StablecoinChainHeatmapPayload } from '$lib/echarts/stablecoin-chain-heatmap';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';
	import { chartFontFamily } from '$lib/scatter-plot/helpers';
	import { onMount, tick } from 'svelte';

	interface Props {
		data: StablecoinChainHeatmapPayload | null;
		dataLoading?: boolean;
		error?: string | null;
	}

	type HeatmapPoint = [number, number, number, number, number, number | null, number | null];

	let { data, dataLoading = false, error = null }: Props = $props();

	let chartContainer = $state<HTMLDivElement | null>(null);
	let chartInstance = $state<ReturnType<EChartsStatic['init']> | null>(null);
	let echartsApi = $state<EChartsStatic | null>(null);
	let resizeObserver = $state<ResizeObserver | null>(null);
	let runtimeReady = $state(false);
	let chartError = $state<string | null>(null);
	let viewportWidth = $state<number>(1440);
	let activeAxisTooltipId = $state<string | null>(null);

	const axisFontStack = chartFontFamily;
	const tooltipFontSize = 14;
	const minClippedAnnualisedReturn = -0.1;
	const maxClippedAnnualisedReturn = 0.1;

	let effectiveError = $derived(error ?? chartError);
	let hasCells = $derived((data?.cells.length ?? 0) > 0);
	let totalTvl = $derived(data?.cells.reduce((sum, cell) => sum + cell.tvl, 0) ?? 0);
	let totalVaultCount = $derived(data?.cells.reduce((sum, cell) => sum + cell.vaultCount, 0) ?? 0);
	let showLegend = $derived(Boolean(data && !dataLoading && !effectiveError && hasCells));
	let chainCount = $derived(data?.chains.length ?? 0);
	let stablecoinCount = $derived(data?.stablecoins.length ?? 0);
	let chartHeight = $derived.by(() => {
		const rowCount = data?.stablecoins.length ?? 0;
		const mobile = viewportWidth <= 768;
		const rowHeight = mobile ? 36 : 44;
		const base = mobile ? 120 : 140;
		return Math.max(mobile ? 420 : 520, rowCount * rowHeight + base);
	});

	function formatAnnualisedMonthlyReturn(apy: number | null) {
		return apy == null ? 'n/a' : formatRate(apy * 100, 1);
	}

	function formatCellMonthlyReturn(monthlyReturn: number | null) {
		return monthlyReturn == null ? 'n/a' : formatRate(monthlyReturn * 100, 1);
	}

	function buildAxisTooltipValue(totalTvl: number) {
		return formatUsd(totalTvl);
	}

	function getAxisTooltipId(kind: 'chain' | 'stablecoin', key: string) {
		return `${kind}-tooltip-${key}`;
	}

	function showAxisTooltip(id: string) {
		activeAxisTooltipId = id;
	}

	function hideAxisTooltip(id: string) {
		if (activeAxisTooltipId === id) {
			activeAxisTooltipId = null;
		}
	}

	function getAxisTooltipStyle(kind: 'chain' | 'stablecoin', tooltipId: string) {
		const active = activeAxisTooltipId === tooltipId;
		if (kind === 'stablecoin') {
			return `opacity: ${active ? 1 : 0}; transform: translate(0, 50%);`;
		}

		return `opacity: ${active ? 1 : 0}; transform: translate(-50%, calc(-100% - ${active ? '0.55rem' : '0.2rem'}));`;
	}

	function clampColourReturn(value: number | null) {
		if (value == null || !Number.isFinite(value)) return minClippedAnnualisedReturn;
		return Math.max(minClippedAnnualisedReturn, Math.min(maxClippedAnnualisedReturn, value));
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

	function buildHeatmapData() {
		if (!data) return [];

		const points: HeatmapPoint[] = [];
		const chainIndex = new Map(data.chains.map((chain, index) => [chain.key, index]));
		const stablecoinIndex = new Map(data.stablecoins.map((stablecoin, index) => [stablecoin.key, index]));

		for (const cell of data.cells) {
			const chainIdx = chainIndex.get(cell.chainKey);
			const stablecoinIdx = stablecoinIndex.get(cell.stablecoinKey);
			if (chainIdx === undefined || stablecoinIdx === undefined) continue;

			const rawTvl = cell.tvl;
			if (!(rawTvl > 0)) continue;

			const colourReturn = clampColourReturn(cell.apy);
			points.push([chainIdx, stablecoinIdx, colourReturn, rawTvl, cell.vaultCount, cell.apy, cell.monthlyReturn]);
		}

		return { points };
	}

	function buildTooltip(params: { data?: HeatmapPoint }) {
		if (!data || !params.data) return '';

		const [chainIndex, stablecoinIndex, _colourTvl, tvl, vaultCount, apy, monthlyReturn] = params.data;
		const chain = data.chains[chainIndex];
		const stablecoin = data.stablecoins[stablecoinIndex];
		if (!chain || !stablecoin) return '';

		const chainShare = chain.totalTvl > 0 ? ((tvl / chain.totalTvl) * 100).toFixed(1) : '0.0';
		const stablecoinShare = stablecoin.totalTvl > 0 ? ((tvl / stablecoin.totalTvl) * 100).toFixed(1) : '0.0';

		return [
			`<div style="margin-bottom: 0.35rem; color: #ffffff; font-family: ${chartFontFamily}; font-size: 1rem; font-weight: 700;">${stablecoin.label} on ${chain.label}</div>`,
			`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>Total TVL</span><strong>${formatUsd(tvl)}</strong></div>`,
			`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>Avg. annualised 1M return</span><strong>${formatAnnualisedMonthlyReturn(apy)}</strong></div>`,
			`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>Avg. monthly return</span><strong>${formatCellMonthlyReturn(monthlyReturn)}</strong></div>`,
			`<div style="color: #d5deea; font-family: ${chartFontFamily}; display: flex; justify-content: space-between; gap: 1rem;"><span>Vaults</span><strong>${vaultCount}</strong></div>`,
			`<div style="margin-top: 0.45rem; color: #94a3b8; font-family: ${chartFontFamily};">This cell is ${chainShare}% of ${chain.label} and ${stablecoinShare}% of ${stablecoin.label} TVL.</div>`
		].join('');
	}

	async function renderChart() {
		if (!chartContainer || !echartsApi) return;

		if (!data || !hasCells) {
			chartError = null;
			destroyChart();
			return;
		}

		const existingInstance = echartsApi.getInstanceByDom(chartContainer);
		existingInstance?.dispose();
		destroyChart();

		const isMobile = viewportWidth <= 768;
		const { points } = buildHeatmapData();
		chartInstance = echartsApi.init(chartContainer);
		chartInstance.setOption({
			animationDuration: 350,
			animationEasing: 'quadraticOut',
			backgroundColor: 'transparent',
			grid: {
				show: true,
				top: 8,
				right: 8,
				bottom: 8,
				left: 8,
				borderColor: '#64748b',
				borderWidth: 1,
				containLabel: false
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
				formatter: (params: { data?: HeatmapPoint }) => buildTooltip(params)
			},
			xAxis: {
				type: 'category',
				data: data.chains.map((chain) => chain.label),
				show: false,
				splitArea: { show: false }
			},
			yAxis: {
				type: 'category',
				data: data.stablecoins.map((stablecoin) => stablecoin.label),
				show: false
			},
			visualMap: {
				dimension: 2,
				min: minClippedAnnualisedReturn,
				max: maxClippedAnnualisedReturn,
				calculable: false,
				orient: 'horizontal',
				left: 'center',
				bottom: isMobile ? 10 : 12,
				itemWidth: isMobile ? 120 : 156,
				itemHeight: 10,
				text: ['10% ann. 1M return', '-10% ann. 1M return'],
				textGap: 12,
				showLabel: false,
				show: false,
				textStyle: {
					color: '#d5deea',
					fontFamily: axisFontStack,
					fontSize: isMobile ? 11 : 12,
					fontWeight: 600
				},
				inRange: {
					color: ['#dc2626', '#facc15', '#22c55e']
				}
			},
			series: [
				{
					type: 'heatmap',
					encode: {
						value: 2
					},
					data: points,
					label: {
						show: true,
						formatter: (params: { data?: HeatmapPoint }) => formatAnnualisedMonthlyReturn(params.data?.[5] ?? null),
						color: '#f8fafc',
						fontFamily: axisFontStack,
						fontSize: isMobile ? 10.35 : 15.8,
						fontWeight: 700,
						textBorderColor: 'rgba(15, 23, 42, 0.92)',
						textBorderWidth: 2
					},
					itemStyle: {
						borderWidth: 1,
						borderColor: 'rgba(148, 163, 184, 0.18)',
						borderRadius: 4
					},
					emphasis: {
						label: {
							show: true,
							formatter: (params: { data?: HeatmapPoint }) => formatAnnualisedMonthlyReturn(params.data?.[5] ?? null)
						},
						itemStyle: {
							borderWidth: 1,
							borderColor: 'rgba(248, 250, 252, 0.45)',
							shadowBlur: 14,
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
		let disposed = false;
		const handleWindowResize = () => {
			viewportWidth = window.innerWidth;
			chartInstance?.resize();
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
		viewportWidth;
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

<ScatterPlotShell
	loading={dataLoading}
	error={effectiveError}
	showMinTvlControl={false}
	className="stablecoin-chain-heatmap-chart standalone-stablecoin-chain-heatmap-shell"
>
	{#snippet chartContent()}
		{#if !hasCells}
			<div class="chart-state" style={`height: ${chartHeight}px;`}>
				<p>No stablecoin / chain heatmap data available.</p>
			</div>
		{:else}
			<div
				class="heatmap-layout"
				style={`--chain-count: ${chainCount}; --stablecoin-count: ${stablecoinCount}; --chart-height: ${chartHeight}px;`}
			>
				<div class="stablecoin-axis" aria-label="Stablecoins">
					{#each data?.stablecoins ?? [] as stablecoin (stablecoin.key)}
						{@const tooltipId = getAxisTooltipId('stablecoin', stablecoin.key)}
						<a
							class="axis-label stablecoin-label"
							href={stablecoin.href}
							aria-describedby={tooltipId}
							data-tooltip-active={activeAxisTooltipId === tooltipId ? 'true' : 'false'}
							onmouseenter={() => showAxisTooltip(tooltipId)}
							onmouseleave={() => hideAxisTooltip(tooltipId)}
							onfocus={() => showAxisTooltip(tooltipId)}
							onblur={() => hideAxisTooltip(tooltipId)}
						>
							{#if stablecoin.logoUrl}
								<img class="axis-logo" src={stablecoin.logoUrl} alt="" loading="lazy" />
							{/if}
							<span>{stablecoin.label}</span>
							<span
								id={tooltipId}
								class="axis-tooltip"
								role="tooltip"
								style={getAxisTooltipStyle('stablecoin', tooltipId)}
							>
								<span class="axis-tooltip-title">{stablecoin.tooltipLabel}</span>
								<span class="axis-tooltip-metric-line">
									TVL:&nbsp;<span class="axis-tooltip-metric-value">{buildAxisTooltipValue(stablecoin.totalTvl)}</span>
								</span>
								<span class="axis-tooltip-cta">Click here to view more.</span>
							</span>
						</a>
					{/each}
				</div>

				<div bind:this={chartContainer} class="chart-canvas" style={`height: ${chartHeight}px;`}></div>

				<div class="chain-axis-spacer"></div>
				<div class="chain-axis" aria-label="Chains">
					{#each data?.chains ?? [] as chain (chain.key)}
						{@const tooltipId = getAxisTooltipId('chain', chain.key)}
						<a
							class="axis-label chain-label"
							href={chain.href}
							aria-describedby={tooltipId}
							data-tooltip-active={activeAxisTooltipId === tooltipId ? 'true' : 'false'}
							onmouseenter={() => showAxisTooltip(tooltipId)}
							onmouseleave={() => hideAxisTooltip(tooltipId)}
							onfocus={() => showAxisTooltip(tooltipId)}
							onblur={() => hideAxisTooltip(tooltipId)}
						>
							{#if chain.logoUrl}
								<img class="axis-logo" src={chain.logoUrl} alt="" loading="lazy" />
							{/if}
							<span>{chain.label}</span>
							<span id={tooltipId} class="axis-tooltip" role="tooltip" style={getAxisTooltipStyle('chain', tooltipId)}>
								<span class="axis-tooltip-title">{chain.label}</span>
								<span class="axis-tooltip-metric-line">
									TVL:&nbsp;<span class="axis-tooltip-metric-value">{buildAxisTooltipValue(chain.totalTvl)}</span>
								</span>
								<span class="axis-tooltip-cta">Click here to view more.</span>
							</span>
						</a>
					{/each}
				</div>
			</div>
		{/if}
	{/snippet}

	{#snippet belowChart()}
		<div class="heatmap-footer">
			{#if showLegend}
				<div class="colour-legend" aria-hidden="true">
					<span>-10% ann. 1M return</span>
					<span class="colour-legend-bar"></span>
					<span>10% ann. 1M return</span>
				</div>
			{/if}

			{#if data && !dataLoading && !effectiveError && hasCells}
				<p class="chart-summary">
					The heatmap covers {formatUsd(totalTvl)} TVL across {totalVaultCount} stablecoin vaults.
				</p>
			{/if}
		</div>
	{/snippet}
</ScatterPlotShell>

<style>
	.chart-canvas {
		width: 100%;
		position: relative;
		z-index: 0;
	}

	.heatmap-layout {
		display: grid;
		grid-template-columns: clamp(6rem, 9vw, 8rem) minmax(0, 1fr);
		grid-template-rows: minmax(0, var(--chart-height)) minmax(6rem, auto);
		column-gap: 0.9rem;
		row-gap: 1rem;
		align-items: stretch;
	}

	.stablecoin-axis {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-rows: repeat(var(--stablecoin-count), minmax(0, 1fr));
		align-items: stretch;
		height: var(--chart-height);
	}

	.chain-axis {
		position: relative;
		z-index: 2;
		display: grid;
		grid-template-columns: repeat(var(--chain-count), minmax(0, 1fr));
		align-items: start;
		gap: 0.35rem;
		min-height: 6rem;
		padding-top: 0.2rem;
		padding-bottom: 0.35rem;
	}

	.chain-axis-spacer {
		min-width: 0;
	}

	.axis-label {
		position: relative;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.45rem;
		color: color-mix(in srgb, var(--c-text-light), white 18%);
		text-decoration: none;
		font: var(--f-body-sm-medium);
		transition:
			color 120ms ease,
			transform 120ms ease,
			opacity 120ms ease;
	}

	.axis-label:hover {
		color: white;
		transform: translateY(-1px);
	}

	.axis-label:focus-visible {
		outline: 2px solid color-mix(in srgb, var(--c-link), white 10%);
		outline-offset: 2px;
		border-radius: 0.5rem;
	}

	.axis-tooltip {
		position: absolute;
		left: 50%;
		bottom: 100%;
		z-index: 30;
		display: grid;
		gap: 0.28rem;
		width: max-content;
		max-width: min(17rem, 46vw);
		padding: 0.7rem 0.85rem;
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 16%);
		border-radius: 0.65rem;
		background: rgba(15, 23, 42, 0.96);
		box-shadow:
			0 0.75rem 1.6rem rgba(2, 8, 23, 0.38),
			inset 0 1px 0 rgba(255, 255, 255, 0.05);
		color: #f8fafc;
		font: var(--f-ui-sm-medium);
		font-size: 0.9rem;
		letter-spacing: var(--f-ui-sm-spacing, normal);
		line-height: 1.42;
		text-align: left;
		white-space: normal;
		pointer-events: none;
		opacity: 0;
		transform: translate(-50%, calc(-100% - 0.2rem));
		transition:
			opacity 140ms ease,
			transform 140ms ease;
	}

	.axis-tooltip-title {
		display: block;
		color: #ffffff;
		font: var(--f-ui-sm-bold);
		font-size: 0.98rem;
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}

	.axis-tooltip-copy {
		display: block;
		color: #d5deea;
	}

	.axis-tooltip-metric-line {
		display: block;
		color: #cbd5e1;
		font: var(--f-ui-sm-medium);
		font-size: 0.9rem;
		letter-spacing: var(--f-ui-sm-spacing, normal);
		white-space: nowrap;
	}

	.axis-tooltip-metric-value {
		color: #f8fafc;
		font: var(--f-ui-sm-bold);
		letter-spacing: var(--f-ui-sm-spacing, normal);
	}

	.axis-tooltip-cta {
		display: block;
		color: #f8fafc;
		text-decoration: underline;
		text-underline-offset: 0.12em;
	}

	.axis-tooltip::after {
		content: '';
		position: absolute;
		left: 50%;
		top: 100%;
		width: 0.6rem;
		height: 0.6rem;
		border-right: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 16%);
		border-bottom: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 16%);
		background: rgba(15, 23, 42, 0.96);
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.axis-logo {
		width: 1.1rem;
		height: 1.1rem;
		border-radius: 999px;
		object-fit: contain;
		flex: 0 0 auto;
	}

	.stablecoin-label {
		justify-content: flex-end;
		padding-right: 0.25rem;
	}

	.stablecoin-label .axis-tooltip {
		left: calc(100% + 0.55rem);
		right: auto;
		bottom: 50%;
		transform: translate(0, 50%);
	}

	.stablecoin-label:hover .axis-tooltip,
	.stablecoin-label:focus-visible .axis-tooltip {
		transform: translate(0, 50%);
	}

	.stablecoin-label .axis-tooltip::after {
		left: 0;
		top: 50%;
		transform: translate(-50%, -50%) rotate(45deg);
	}

	.chain-label {
		flex-direction: column;
		justify-content: flex-start;
		align-items: center;
		transform: rotate(-45deg);
		transform-origin: top center;
		text-align: center;
		gap: 0.22rem;
		font-size: 0.8rem;
		line-height: 1.05;
		padding-inline: 0.1rem;
		white-space: nowrap;
	}

	.chart-state {
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

	.heatmap-footer {
		display: grid;
		gap: 1rem;
		padding-bottom: 1.25rem;
	}

	.colour-legend {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.85rem;
		color: color-mix(in srgb, var(--c-text-light), white 14%);
		font: var(--f-body-sm-medium);
	}

	.colour-legend-bar {
		width: min(14rem, 34vw);
		height: 0.75rem;
		border-radius: 999px;
		border: 1px solid color-mix(in srgb, var(--c-box-4), var(--c-text-light) 18%);
		background: linear-gradient(90deg, #dc2626 0%, #facc15 50%, #22c55e 100%);
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.08);
	}

	@media (--viewport-sm-down) {
		.heatmap-layout {
			grid-template-columns: clamp(4.25rem, 18vw, 5.1rem) minmax(0, 1fr);
			column-gap: 0.55rem;
			grid-template-rows: minmax(0, var(--chart-height)) minmax(4.9rem, auto);
			row-gap: 0.65rem;
		}

		.axis-logo {
			width: 0.92rem;
			height: 0.92rem;
		}

		.stablecoin-label {
			font-size: 0.78rem;
			gap: 0.28rem;
		}

		.chain-label {
			font-size: 0.64rem;
			gap: 0.14rem;
		}

		.axis-tooltip {
			max-width: min(13rem, 58vw);
			font-size: 0.7rem;
		}

		.chain-axis {
			min-height: 4.9rem;
			padding-bottom: 0.25rem;
		}

		.colour-legend {
			gap: 0.6rem;
			font-size: 0.82rem;
		}

		.colour-legend-bar {
			width: min(9rem, 38vw);
			height: 0.65rem;
		}

		.heatmap-footer {
			padding-bottom: 1.6rem;
		}
	}
</style>

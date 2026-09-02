<!--
@component
Renders the server-derived current versus peak TVL chart.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { VaultScatterChartData } from '$lib/vault-chart-data';
	import {
		buildChartConfig,
		buildPlotlyChrome,
		buildMarker,
		chartAxisBorder,
		chartGridColor,
		chartTextColor,
		loadPlotly
	} from '$lib/scatter-plot/helpers';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let minTvl = $state(50_000);
	let colourBy = $state<'chain' | 'protocol'>('chain');
	let logAxes = $state(true);
	let data = $state<VaultScatterChartData>();
	let loading = $state(true);
	let error = $state<string | null>(null);

	function addIsolatingLegend(Plotly: any, traces: unknown[]) {
		(chartContainer as any).on('plotly_legendclick', (event: any) => {
			const clicked = event.curveNumber;
			const visibleStates: (boolean | string)[] = (chartContainer as any).data.map(
				(trace: any) => trace.visible ?? true
			);
			const allVisible = visibleStates.every((visible) => visible === true);
			const visibleCount = visibleStates.filter((visible) => visible === true).length;
			const next: (boolean | string)[] = new Array(traces.length);

			if (allVisible) {
				for (let index = 0; index < traces.length; index++) next[index] = index === clicked ? true : 'legendonly';
			} else if (visibleStates[clicked] === true && visibleCount <= 1) {
				next.fill(true);
			} else if (visibleStates[clicked] === true) {
				for (let index = 0; index < traces.length; index++)
					next[index] = index === clicked ? 'legendonly' : visibleStates[index];
			} else {
				for (let index = 0; index < traces.length; index++)
					next[index] = index === clicked ? true : visibleStates[index];
				if (next.every((visible) => visible === true)) next.fill(true);
			}

			Plotly.restyle(chartContainer, { visible: next });
			return false;
		});
	}

	$effect(() => {
		let cancelled = false;
		loading = true;
		error = null;
		fetch(`/vaults/current-peak-tvl/chart-data?minTvl=${minTvl}&colourBy=${colourBy}`)
			.then((response) =>
				response.ok
					? (response.json() as Promise<VaultScatterChartData>)
					: Promise.reject(new Error(`Chart request failed (${response.status})`))
			)
			.then((payload) => {
				if (!cancelled) data = payload;
			})
			.catch((cause) => {
				if (!cancelled) error = cause instanceof Error ? cause.message : 'Failed to load chart';
			})
			.finally(() => {
				if (!cancelled) loading = false;
			});
		return () => {
			cancelled = true;
		};
	});

	$effect(() => {
		const payload = data;
		if (!payload || loading || error) return;
		let cancelled = false;
		(async () => {
			if (!payload.pointCount) {
				error = 'No vaults with both current and peak TVL data available.';
				return;
			}
			const Plotly = await loadPlotly();
			if (cancelled) return;
			const values = payload.traces.flatMap((trace) => trace.points.flatMap((point) => [point.x, point.y]));
			const min = Math.max(Math.min(...values), minTvl);
			const max = Math.max(...values);
			const axisType = logAxes ? 'log' : 'linear';
			const rawRange = logAxes ? [Math.log10(min), Math.log10(max)] : [min, max];
			const padding = (rawRange[1] - rawRange[0]) * 0.05;
			const range: [number, number] = [rawRange[0] - padding, rawRange[1] + padding];
			const diagonal = logAxes ? [10 ** range[0], 10 ** range[1]] : range;
			const isMobile = window.innerWidth <= 768;
			const chrome = buildPlotlyChrome();
			const layout = {
				xaxis: {
					title: window.innerWidth <= 768 ? undefined : '<b>Peak TVL (USD)</b>',
					type: axisType,
					range,
					gridcolor: chartGridColor,
					color: chartTextColor,
					...chartAxisBorder
				},
				yaxis: {
					title: window.innerWidth <= 768 ? undefined : '<b>Current TVL (USD)</b>',
					type: axisType,
					range,
					gridcolor: chartGridColor,
					color: chartTextColor,
					...chartAxisBorder
				},
				shapes: [
					{
						type: 'line',
						x0: diagonal[0],
						y0: diagonal[0],
						x1: diagonal[1],
						y1: diagonal[1],
						line: { color: 'rgba(255,255,255,0.3)', width: 1, dash: 'dash' }
					}
				],
				...chrome,
				height: 600,
				margin: isMobile ? { t: 10, r: 10, b: 100, l: 10 } : { t: 20, r: 20, b: 100, l: 80 },
				legend: {
					...(chrome.legend as Record<string, any>),
					title: { text: colourBy === 'chain' ? 'Chain' : 'Protocol' },
					orientation: 'h',
					yanchor: 'top',
					y: -0.15,
					xanchor: 'center',
					x: 0.5,
					itemclick: false,
					itemdoubleclick: false
				},
				dragmode: isMobile ? false : 'zoom',
				autosize: true
			};
			const traces = payload.traces.map((trace) => ({
				x: trace.points.map((point) => point.x),
				y: trace.points.map((point) => point.y),
				text: trace.points.map((point) => point.hover),
				customdata: trace.points.map((point) => point.url),
				name: trace.name,
				type: 'scatter',
				mode: 'markers',
				marker: buildMarker(trace.colour),
				hovertemplate: '%{text}<extra></extra>'
			}));
			await Plotly.newPlot(chartContainer, traces, layout, buildChartConfig());
			(chartContainer as any).on('plotly_click', (event: any) => {
				const url = event.points?.[0]?.customdata;
				if (url) goto(url);
			});
			addIsolatingLegend(Plotly, traces);
		})().catch((cause) => {
			if (!cancelled) error = cause instanceof Error ? cause.message : 'Failed to render chart';
		});
		return () => {
			cancelled = true;
			if (chartContainer && (window as any).Plotly) (window as any).Plotly.purge(chartContainer);
		};
	});
</script>

<ScatterPlotShell bind:chartContainer {loading} {error} bind:minTvl watermarkCorner="top-left">
	{#snippet extraControls()}
		<label
			>Group by: <select
				value={colourBy}
				onchange={(event) => (colourBy = event.currentTarget.value as 'chain' | 'protocol')}
				><option value="chain">Chain</option><option value="protocol">Protocol</option></select
			></label
		>
		<label class="checkbox-label"
			><input type="checkbox" checked={logAxes} onchange={() => (logAxes = !logAxes)} /> Logarithmic axes</label
		>
	{/snippet}
	{#snippet belowChart()}
		{#if data?.excludedCount}<p class="excluded-notice">
				{data.excludedCount} vault{data.excludedCount === 1 ? '' : 's'} with unknown chain not included in this chart.
			</p>{/if}
	{/snippet}
</ScatterPlotShell>

<style>
	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
	}
	.excluded-notice {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-top: 0.75rem;
	}
</style>

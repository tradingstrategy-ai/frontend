<!--
@component
Renders a server-derived yield scatter chart. Only chart points, groups, hover
text, and detail links are fetched; complete vault records stay on the server.
-->
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { VaultScatterChartData } from '$lib/vault-chart-data';
	import {
		buildChartConfig,
		buildChartLayout,
		buildMarker,
		computeAxisRange,
		loadPlotly,
		minReturnLog
	} from './helpers';
	import ScatterPlotShell from './ScatterPlotShell.svelte';

	interface Props {
		endpoint: string;
		legendTitle: string;
		excludedLabel?: string;
		/** Preserve the scatter pages' isolate-then-toggle legend interaction. */
		isolateLegend?: boolean;
	}

	let { endpoint, legendTitle, excludedLabel, isolateLegend = false }: Props = $props();

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
	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let minTvl = $state(50_000);
	let logAxes = $state(true);
	let data = $state<VaultScatterChartData>();
	let loading = $state(true);
	let error = $state<string | null>(null);

	$effect(() => {
		let cancelled = false;
		loading = true;
		error = null;
		fetch(`${endpoint}?minTvl=${minTvl}`)
			.then((response) => {
				if (!response.ok) throw new Error(`Chart request failed (${response.status})`);
				return response.json() as Promise<VaultScatterChartData>;
			})
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
				error = 'No vaults with both TVL and three-month return data available.';
				return;
			}
			const Plotly = await loadPlotly();
			if (cancelled) return;
			const points = payload.traces.flatMap((trace) => trace.points);
			const x = points.map((point) => Math.max(point.x, minReturnLog));
			const y = points.map((point) => point.y);
			const layout = buildChartLayout(legendTitle, computeAxisRange(x, logAxes), computeAxisRange(y, logAxes), logAxes);
			if (isolateLegend) {
				layout.legend.itemclick = false;
				layout.legend.itemdoubleclick = false;
			}
			const traces = payload.traces.map((trace) => ({
				x: trace.points.map((point) => (logAxes ? Math.max(point.x, minReturnLog) : point.x)),
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
			if (isolateLegend) addIsolatingLegend(Plotly, traces);
		})().catch((cause) => {
			if (!cancelled) error = cause instanceof Error ? cause.message : 'Failed to render chart';
		});
		return () => {
			cancelled = true;
			if (chartContainer && (window as any).Plotly) (window as any).Plotly.purge(chartContainer);
		};
	});
</script>

<ScatterPlotShell bind:chartContainer {loading} {error} bind:minTvl watermarkCorner="top-right">
	{#snippet extraControls()}
		<label class="checkbox-label"
			><input type="checkbox" checked={logAxes} onchange={() => (logAxes = !logAxes)} /> Logarithmic axes</label
		>
	{/snippet}
	{#snippet belowChart()}
		{#if data?.excludedCount && excludedLabel}
			<p class="excluded-notice">
				{data.excludedCount} vault{data.excludedCount === 1 ? '' : 's'} with unknown {excludedLabel} not included in this
				chart.
			</p>
		{/if}
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

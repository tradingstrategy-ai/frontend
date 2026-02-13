<!--
@component
Scatter plot of vault peak TVL (X, logarithmic) versus current TVL (Y, logarithmic),
coloured by blockchain or protocol. A diagonal reference line marks where current equals peak.
Vaults below the diagonal have lost TVL since their peak.
Plotly.js is loaded dynamically from CDN.

- Vaults with unrecognised chain IDs are excluded
- Groups with two or fewer vaults are grouped as "Other" in grey
- Each group is a separate Plotly trace for legend toggling

@example
```svelte
  <TvlScatterPlot vaults={topVaults.vaults} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import { resolveVaultDetails } from '$lib/top-vaults/helpers';
	import { getChain } from '$lib/helpers/chain';
	import {
		loadPlotly,
		buildMarker,
		buildChartConfig,
		protocolPalette,
		greyColor,
		formatReturn
	} from '$lib/scatter-plot/helpers';
	import { goto } from '$app/navigation';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	interface Props {
		vaults: VaultInfo[];
	}

	let { vaults }: Props = $props();

	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let minTvl = $state(50_000);
	let colourBy = $state<'chain' | 'protocol'>('chain');

	/** Vaults that pass base eligibility (not blacklisted, have both current and peak TVL). */
	let baseEligible = $derived(
		vaults.filter(
			(v) =>
				!isBlacklisted(v) &&
				v.current_nav != null &&
				v.current_nav >= minTvl &&
				v.peak_nav != null &&
				v.peak_nav <= 50_000_000_000
		)
	);

	/** Vaults excluded because chain is unrecognised. */
	let excludedCount = $derived(baseEligible.filter((v) => !getChain(v.chain_id)).length);

	/** Vaults included in the chart (known chain only). */
	let eligibleVaults = $derived(baseEligible.filter((v) => getChain(v.chain_id)));

	function formatTvl(value: number): string {
		return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
	}

	function formatHoverText(v: VaultInfo): string {
		const chainName = getChain(v.chain_id)?.name ?? `Chain ${v.chain_id}`;
		const retention = v.current_nav! / v.peak_nav!;
		return [
			`<b>${v.name}</b>`,
			v.protocol,
			`Chain: ${chainName}`,
			`Current TVL: ${formatTvl(v.current_nav!)}`,
			`Peak TVL: ${formatTvl(v.peak_nav!)}`,
			`Retention: ${(retention * 100).toFixed(1)}%`,
			`3M return (ann.): ${formatReturn(v.three_months_cagr)}`
		].join('<br>');
	}

	/** Build a scatter trace for a group of vaults. */
	function buildTvlTrace(group: VaultInfo[], name: string, color: string) {
		return {
			x: group.map((v) => v.peak_nav!),
			y: group.map((v) => v.current_nav!),
			text: group.map(formatHoverText),
			customdata: group.map((v) => resolveVaultDetails(v)),
			name,
			type: 'scatter' as const,
			mode: 'markers' as const,
			marker: buildMarker(color),
			hovertemplate: '%{text}<extra></extra>'
		};
	}

	/**
	 * Group vaults by chain, assign colours by vault count descending.
	 * Chains with <= 2 vaults become "Other" (grey).
	 */
	function buildChainTraces(currentVaults: VaultInfo[]): any[] {
		const chainCounts = new Map<number, number>();
		for (const v of currentVaults) {
			chainCounts.set(v.chain_id, (chainCounts.get(v.chain_id) ?? 0) + 1);
		}

		const sortedChains = [...chainCounts.entries()]
			.map(([chainId, count]) => ({ chainId, name: getChain(chainId)!.name, count }))
			.sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));

		const majorChains = sortedChains.filter(({ count }) => count > 2);
		const otherChainIds = new Set(sortedChains.filter(({ count }) => count <= 2).map(({ chainId }) => chainId));

		const traces: any[] = [];

		for (let i = 0; i < majorChains.length; i++) {
			const { chainId, name } = majorChains[i];
			const color = protocolPalette[i % protocolPalette.length];
			const group = currentVaults.filter((v) => v.chain_id === chainId);
			traces.push(buildTvlTrace(group, name, color));
		}

		const otherVaults = currentVaults.filter((v) => otherChainIds.has(v.chain_id));
		if (otherVaults.length > 0) {
			traces.push(buildTvlTrace(otherVaults, 'Other', greyColor));
		}

		return traces;
	}

	/**
	 * Group vaults by protocol, assign colours by vault count descending.
	 * Protocols with <= 2 vaults become "Other" (grey).
	 */
	function buildProtocolTraces(currentVaults: VaultInfo[]): any[] {
		const protocolCounts = new Map<string, number>();
		for (const v of currentVaults) {
			protocolCounts.set(v.protocol, (protocolCounts.get(v.protocol) ?? 0) + 1);
		}

		const sortedProtocols = [...protocolCounts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));

		const majorProtocols = sortedProtocols.filter(([, count]) => count > 2);
		const otherProtocols = new Set(sortedProtocols.filter(([, count]) => count <= 2).map(([name]) => name));

		const traces: any[] = [];

		for (let i = 0; i < majorProtocols.length; i++) {
			const [protocol] = majorProtocols[i];
			const color = protocolPalette[i % protocolPalette.length];
			const group = currentVaults.filter((v) => v.protocol === protocol);
			traces.push(buildTvlTrace(group, protocol, color));
		}

		const otherVaults = currentVaults.filter((v) => otherProtocols.has(v.protocol));
		if (otherVaults.length > 0) {
			traces.push(buildTvlTrace(otherVaults, 'Other', greyColor));
		}

		return traces;
	}

	$effect(() => {
		const currentVaults = eligibleVaults;
		const currentColourBy = colourBy;
		let destroyed = false;

		(async () => {
			try {
				loading = true;
				error = null;

				const Plotly = await loadPlotly();
				if (destroyed) return;

				if (currentVaults.length === 0) {
					error = 'No vaults with both current and peak TVL data available.';
					loading = false;
					return;
				}

				const traces =
					currentColourBy === 'chain' ? buildChainTraces(currentVaults) : buildProtocolTraces(currentVaults);

				const allCurrentTvl = currentVaults.map((v) => v.current_nav!);
				const allPeakTvl = currentVaults.map((v) => v.peak_nav!);
				const allValues = [...allCurrentTvl, ...allPeakTvl];
				const logMin = Math.log10(Math.max(Math.min(...allValues), minTvl));
				const logMax = Math.log10(Math.max(...allValues));
				const logPadding = (logMax - logMin) * 0.05;
				const xRange: [number, number] = [logMin - logPadding, logMax + logPadding];
				const yRange: [number, number] = [logMin - logPadding, logMax + logPadding];

				// Diagonal line bounds (in data space, not log space)
				const diagMin = Math.min(xRange[0], yRange[0]);
				const diagMax = Math.max(xRange[1], yRange[1]);

				const layout = {
					xaxis: {
						title: 'Peak TVL (USD)',
						type: 'log' as const,
						range: xRange,
						gridcolor: 'rgba(255,255,255,0.1)',
						color: 'rgba(255,255,255,0.7)'
					},
					yaxis: {
						title: 'Current TVL (USD)',
						type: 'log' as const,
						range: yRange,
						gridcolor: 'rgba(255,255,255,0.1)',
						color: 'rgba(255,255,255,0.7)'
					},
					shapes: [
						{
							type: 'line' as const,
							x0: Math.pow(10, diagMin),
							y0: Math.pow(10, diagMin),
							x1: Math.pow(10, diagMax),
							y1: Math.pow(10, diagMax),
							xref: 'x' as const,
							yref: 'y' as const,
							line: { color: 'rgba(255,255,255,0.3)', width: 1, dash: 'dash' }
						}
					],
					paper_bgcolor: 'transparent',
					plot_bgcolor: 'transparent',
					font: { color: 'rgba(255,255,255,0.7)' },
					legend: {
						title: { text: currentColourBy === 'chain' ? 'Chain' : 'Protocol' },
						orientation: 'h' as const,
						yanchor: 'top' as const,
						y: -0.15,
						xanchor: 'center' as const,
						x: 0.5,
						itemclick: false,
						itemdoubleclick: false
					},
					height: 600,
					margin: { t: 20, r: 20, b: 100, l: 80 },
					dragmode: 'zoom' as const,
					autosize: true
				};

				const config = buildChartConfig();

				if (destroyed) return;

				await Plotly.newPlot(chartContainer, traces, layout, config);

				(chartContainer as any).on('plotly_click', (data: any) => {
					const point = data.points?.[0];
					if (point?.customdata) {
						goto(point.customdata);
					}
				});

				// Custom legend click: first click isolates, subsequent clicks toggle additional chains
				(chartContainer as any).on('plotly_legendclick', (event: any) => {
					const traceCount = traces.length;
					const clicked = event.curveNumber;
					const currentData = (chartContainer as any).data;

					const visibleStates: (boolean | string)[] = currentData.map((t: any) => t.visible ?? true);
					const allVisible = visibleStates.every((v: boolean | string) => v === true);
					const visibleCount = visibleStates.filter((v: boolean | string) => v === true).length;

					const update: (boolean | string)[] = new Array(traceCount);

					if (allVisible) {
						for (let i = 0; i < traceCount; i++) {
							update[i] = i === clicked ? true : 'legendonly';
						}
					} else if (visibleStates[clicked] === true) {
						if (visibleCount <= 1) {
							update.fill(true);
						} else {
							for (let i = 0; i < traceCount; i++) {
								update[i] = i === clicked ? 'legendonly' : visibleStates[i];
							}
						}
					} else {
						for (let i = 0; i < traceCount; i++) {
							update[i] = i === clicked ? true : visibleStates[i];
						}
						if (update.every((v) => v === true)) {
							update.fill(true);
						}
					}

					Plotly.restyle(chartContainer, { visible: update });
					return false;
				});

				loading = false;
			} catch (e) {
				if (!destroyed) {
					error = e instanceof Error ? e.message : 'Failed to load chart';
					loading = false;
				}
			}
		})();

		return () => {
			destroyed = true;
			if (chartContainer && (window as any).Plotly) {
				(window as any).Plotly.purge(chartContainer);
			}
		};
	});
</script>

<ScatterPlotShell bind:chartContainer {loading} {error} bind:minTvl>
	{#snippet extraControls()}
		<label>
			Colour by:
			<select bind:value={colourBy}>
				<option value="chain">Chain</option>
				<option value="protocol">Protocol</option>
			</select>
		</label>
	{/snippet}
	{#snippet belowChart()}
		{#if excludedCount > 0}
			<p class="excluded-notice">
				{excludedCount} vault{excludedCount === 1 ? '' : 's'} with unknown chain not included in this chart.
			</p>
		{/if}
	{/snippet}
</ScatterPlotShell>

<style>
	.excluded-notice {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-top: 0.75rem;
	}
</style>

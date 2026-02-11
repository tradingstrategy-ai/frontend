<!--
@component
Scatter plot of vault TVL (Y, logarithmic) versus three-month returns (X),
coloured by protocol. Plotly.js is loaded dynamically from CDN.

- Vaults with unsupported protocols (name starts with `<`) are excluded
- Protocols with two or fewer vaults are grouped as "Other" in grey
- Each supported protocol is a separate Plotly trace for legend toggling

@example
```svelte
  <ProtocolScatterPlot vaults={topVaults.vaults} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { isBlacklisted, hasSupportedProtocol, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import {
		loadPlotly,
		computeAxisRange,
		buildBaseHoverLines,
		buildMarker,
		buildChartLayout,
		buildChartConfig,
		protocolPalette,
		greyColor
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

	/** Vaults that pass base eligibility (not blacklisted, have TVL + 3-month return). */
	let baseEligible = $derived(
		vaults.filter(
			(v) => !isBlacklisted(v) && v.current_nav != null && v.current_nav >= minTvl && v.three_months_cagr != null
		)
	);

	/** Vaults excluded because protocol is unsupported. */
	let excludedCount = $derived(baseEligible.filter((v) => !hasSupportedProtocol(v)).length);

	/** Vaults included in the chart (supported protocol only). */
	let eligibleVaults = $derived(baseEligible.filter((v) => hasSupportedProtocol(v)));

	function formatHoverText(v: VaultInfo): string {
		const lines = buildBaseHoverLines(v);
		lines.splice(3, 0, `Protocol: ${v.protocol}`);
		return lines.join('<br>');
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

			traces.push({
				x: group.map((v) => v.three_months_cagr! * 100),
				y: group.map((v) => v.current_nav!),
				text: group.map(formatHoverText),
				customdata: group.map((v) => resolveVaultDetails(v)),
				name: protocol,
				type: 'scatter',
				mode: 'markers',
				marker: buildMarker(color),
				hovertemplate: '%{text}<extra></extra>'
			});
		}

		const otherVaults = currentVaults.filter((v) => otherProtocols.has(v.protocol));
		if (otherVaults.length > 0) {
			traces.push({
				x: otherVaults.map((v) => v.three_months_cagr! * 100),
				y: otherVaults.map((v) => v.current_nav!),
				text: otherVaults.map(formatHoverText),
				customdata: otherVaults.map((v) => resolveVaultDetails(v)),
				name: 'Other',
				type: 'scatter',
				mode: 'markers',
				marker: buildMarker(greyColor),
				hovertemplate: '%{text}<extra></extra>'
			});
		}

		return traces;
	}

	$effect(() => {
		const currentVaults = eligibleVaults;
		let destroyed = false;

		(async () => {
			try {
				loading = true;
				error = null;

				const Plotly = await loadPlotly();
				if (destroyed) return;

				if (currentVaults.length === 0) {
					error = 'No vaults with both TVL and three-month return data available.';
					loading = false;
					return;
				}

				const traces = buildProtocolTraces(currentVaults);

				const allReturns = currentVaults.map((v) => v.three_months_cagr! * 100);
				const allTvl = currentVaults.map((v) => v.current_nav!);
				const xRange = computeAxisRange(allReturns);
				const yRange = computeAxisRange(allTvl, true);
				xRange[0] = Math.max(xRange[0], 0);
				yRange[0] = Math.max(yRange[0], Math.log10(minTvl));

				const layout = buildChartLayout('Protocol', xRange, yRange);
				// Disable default legend click — we handle it ourselves below
				layout.legend.itemclick = false;
				layout.legend.itemdoubleclick = false;
				const config = buildChartConfig();

				if (destroyed) return;

				await Plotly.newPlot(chartContainer, traces, layout, config);

				(chartContainer as any).on('plotly_click', (data: any) => {
					const point = data.points?.[0];
					if (point?.customdata) {
						goto(point.customdata);
					}
				});

				// Custom legend click: first click isolates, subsequent clicks toggle additional protocols
				(chartContainer as any).on('plotly_legendclick', (event: any) => {
					const traceCount = traces.length;
					const clicked = event.curveNumber;
					const currentData = (chartContainer as any).data;

					const visibleStates: (boolean | string)[] = currentData.map((t: any) => t.visible ?? true);
					const allVisible = visibleStates.every((v: boolean | string) => v === true);
					const visibleCount = visibleStates.filter((v: boolean | string) => v === true).length;

					const update: (boolean | string)[] = new Array(traceCount);

					if (allVisible) {
						// All visible → isolate the clicked protocol
						for (let i = 0; i < traceCount; i++) {
							update[i] = i === clicked ? true : 'legendonly';
						}
					} else if (visibleStates[clicked] === true) {
						// Clicked one is visible → hide it; if last visible, restore all
						if (visibleCount <= 1) {
							update.fill(true);
						} else {
							for (let i = 0; i < traceCount; i++) {
								update[i] = i === clicked ? 'legendonly' : visibleStates[i];
							}
						}
					} else {
						// Clicked one is hidden → show it too
						for (let i = 0; i < traceCount; i++) {
							update[i] = i === clicked ? true : visibleStates[i];
						}
						// If all would now be visible, just set all to true
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
	{#snippet belowChart()}
		{#if excludedCount > 0}
			<p class="excluded-notice">
				{excludedCount} vault{excludedCount === 1 ? '' : 's'} with unknown protocol not included in this chart.
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

<!--
@component
Scatter plot of vault TVL (Y, logarithmic) versus three-month returns (X),
coloured by blockchain. Plotly.js is loaded dynamically from CDN.

- Vaults with unrecognised chain IDs are excluded
- Chains with two or fewer vaults are grouped as "Other" in grey
- Each supported chain is a separate Plotly trace for legend toggling

@example
```svelte
  <ChainScatterPlot vaults={topVaults.vaults} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import { getChain } from '$lib/helpers/chain';
	import {
		loadPlotly,
		computeScatterRanges,
		buildBaseHoverLines,
		buildTrace,
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

	/** Vaults excluded because chain is unrecognised. */
	let excludedCount = $derived(baseEligible.filter((v) => !getChain(v.chain_id)).length);

	/** Vaults included in the chart (known chain only). */
	let eligibleVaults = $derived(baseEligible.filter((v) => getChain(v.chain_id)));

	function formatHoverText(v: VaultInfo): string {
		const lines = buildBaseHoverLines(v);
		const chainName = getChain(v.chain_id)?.name ?? `Chain ${v.chain_id}`;
		lines.splice(3, 0, `Chain: ${chainName}`);
		return lines.join('<br>');
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
			traces.push(buildTrace(group, name, color, formatHoverText));
		}

		const otherVaults = currentVaults.filter((v) => otherChainIds.has(v.chain_id));
		if (otherVaults.length > 0) {
			traces.push(buildTrace(otherVaults, 'Other', greyColor, formatHoverText));
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

				const traces = buildChainTraces(currentVaults);

				const { xRange, yRange } = computeScatterRanges(currentVaults, minTvl);
				const layout = buildChartLayout('Chain', xRange, yRange);
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
						// All visible → isolate the clicked chain
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

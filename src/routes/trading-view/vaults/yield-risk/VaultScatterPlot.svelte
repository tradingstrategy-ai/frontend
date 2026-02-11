<!--
@component
Scatter plot of vault TVL (Y, logarithmic) versus three-month returns (X),
coloured by risk level. Plotly.js is loaded dynamically from CDN.

- Each risk level is a separate Plotly trace (acts as legend toggle / group selector)
- Outliers are filtered from the initial zoom range using percentile-based axis limits
- Blacklisted vaults (risk_numeric === 999) are excluded

@example
```svelte
  <VaultScatterPlot vaults={topVaults.vaults} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import {
		loadPlotly,
		computeScatterRanges,
		buildBaseHoverLines,
		buildTrace,
		buildChartLayout,
		buildChartConfig,
		greyColor
	} from '$lib/scatter-plot/helpers';
	import { goto } from '$app/navigation';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	interface Props {
		vaults: VaultInfo[];
	}

	let { vaults }: Props = $props();

	const riskConfig = [
		{ risk: 'Negligible', color: '#13b1c0' },
		{ risk: 'Minimal', color: '#22c55e' },
		{ risk: 'Low', color: '#eab308' },
		{ risk: 'High', color: '#f97316' },
		{ risk: 'Severe', color: '#ef4444' },
		{ risk: 'Dangerous', color: '#c62847' }
	] as const;

	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let loading = $state(true);
	let error = $state<string | null>(null);
	let minTvl = $state(50_000);

	let eligibleVaults = $derived(
		vaults.filter(
			(v) => !isBlacklisted(v) && v.current_nav != null && v.current_nav >= minTvl && v.three_months_cagr != null
		)
	);

	function formatHoverText(v: VaultInfo): string {
		const lines = buildBaseHoverLines(v);
		lines.splice(3, 0, `Risk: ${v.risk ?? 'Unknown'}`);
		return lines.join('<br>');
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

				// One trace per risk group
				const traces: any[] = riskConfig
					.map(({ risk, color }) => {
						const group = currentVaults.filter((v) => v.risk === risk);
						if (group.length === 0) return null;
						return buildTrace(group, risk, color, formatHoverText);
					})
					.filter(Boolean);

				// Unknown risk vaults (exclude zero-yield unknowns)
				const unknownVaults = currentVaults.filter(
					(v) => (v.risk == null || !riskConfig.some((r) => r.risk === v.risk)) && v.three_months_cagr !== 0
				);
				if (unknownVaults.length > 0) {
					traces.push(buildTrace(unknownVaults, 'Unknown', greyColor, formatHoverText));
				}

				const { xRange, yRange } = computeScatterRanges(currentVaults, minTvl);
				const layout = buildChartLayout('Technical risk', xRange, yRange);
				const config = buildChartConfig();

				if (destroyed) return;

				await Plotly.newPlot(chartContainer, traces, layout, config);

				(chartContainer as any).on('plotly_click', (data: any) => {
					const point = data.points?.[0];
					if (point?.customdata) {
						goto(point.customdata);
					}
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

<ScatterPlotShell bind:chartContainer {loading} {error} bind:minTvl />

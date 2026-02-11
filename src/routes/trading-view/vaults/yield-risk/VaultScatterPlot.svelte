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
	import { isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
	import { getChain } from '$lib/helpers/chain';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';

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

	let chartContainer: HTMLDivElement;
	let loading = $state(true);
	let error = $state<string | null>(null);

	const tvlOptions = [
		{ value: 50_000, label: '$50k' },
		{ value: 100_000, label: '$100k' },
		{ value: 250_000, label: '$250k' },
		{ value: 500_000, label: '$500k' },
		{ value: 1_000_000, label: '$1M' },
		{ value: 2_000_000, label: '$2M' }
	];

	let minTvl = $state(50_000);

	let eligibleVaults = $derived(
		vaults.filter(
			(v) => !isBlacklisted(v) && v.current_nav != null && v.current_nav >= minTvl && v.three_months_cagr != null
		)
	);

	/**
	 * Calculate percentile value from a sorted numeric array.
	 * @param sorted - Array of numbers in ascending order
	 * @param p - Percentile (0–100)
	 */
	function percentile(sorted: number[], p: number): number {
		const idx = (p / 100) * (sorted.length - 1);
		const lo = Math.floor(idx);
		const hi = Math.ceil(idx);
		if (lo === hi) return sorted[lo];
		return sorted[lo] + (sorted[hi] - sorted[lo]) * (idx - lo);
	}

	/**
	 * Compute axis range clipping outliers at the 2nd and 98th percentile.
	 * @param values - Raw data values
	 * @param isLog - Whether the axis uses log scale (returns log10 values)
	 */
	function computeAxisRange(values: number[], isLog = false): [number, number] {
		const sorted = [...values].sort((a, b) => a - b);
		const p2 = percentile(sorted, 2);
		const p98 = percentile(sorted, 98);
		const span = p98 - p2;
		const padding = span * 0.1;

		if (isLog) {
			const logMin = Math.log10(Math.max(p2 - padding, 1));
			const logMax = Math.log10(p98 + padding);
			return [logMin, logMax];
		}
		return [p2 - padding, p98 + padding];
	}

	/** Load Plotly.js from CDN by injecting a script tag. Idempotent. */
	function loadPlotly(): Promise<any> {
		return new Promise((resolve, reject) => {
			if ((window as any).Plotly) {
				resolve((window as any).Plotly);
				return;
			}
			const script = document.createElement('script');
			script.src = 'https://cdn.plot.ly/plotly-2.35.2.min.js';
			script.async = true;
			script.onload = () => resolve((window as any).Plotly);
			script.onerror = () => reject(new Error('Failed to load Plotly.js'));
			document.head.appendChild(script);
		});
	}

	function formatReturn(value: number | null | undefined): string {
		return value != null ? `${(value * 100).toFixed(1)}%` : 'n/a';
	}

	function formatHoverText(v: VaultInfo): string {
		const chainName = getChain(v.chain_id)?.name ?? `Chain ${v.chain_id}`;
		const tvl = `$${v.current_nav!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
		return [
			`<b>${v.name}</b>`,
			v.protocol,
			chainName,
			`Risk: ${v.risk ?? 'Unknown'}`,
			`TVL: ${tvl}`,
			`1M return (ann.): ${formatReturn(v.one_month_cagr)}`,
			`3M return (ann.): ${formatReturn(v.three_months_cagr)}`
		].join('<br>');
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
						return {
							x: group.map((v) => v.three_months_cagr! * 100),
							y: group.map((v) => v.current_nav!),
							text: group.map(formatHoverText),
							customdata: group.map((v) => resolveVaultDetails(v)),
							name: risk,
							type: 'scatter',
							mode: 'markers',
							marker: {
								color,
								size: 8,
								opacity: 0.8,
								line: { width: 1, color: 'rgba(255,255,255,0.3)' }
							},
							hovertemplate: '%{text}<extra></extra>'
						};
					})
					.filter(Boolean);

				// Unknown risk vaults
				const unknownVaults = currentVaults.filter((v) => v.risk == null || !riskConfig.some((r) => r.risk === v.risk));
				if (unknownVaults.length > 0) {
					traces.push({
						x: unknownVaults.map((v) => v.three_months_cagr! * 100),
						y: unknownVaults.map((v) => v.current_nav!),
						text: unknownVaults.map(formatHoverText),
						customdata: unknownVaults.map((v) => resolveVaultDetails(v)),
						name: 'Unknown',
						type: 'scatter',
						mode: 'markers',
						marker: {
							color: '#9ca3af',
							size: 8,
							opacity: 0.8,
							line: { width: 1, color: 'rgba(255,255,255,0.3)' }
						},
						hovertemplate: '%{text}<extra></extra>'
					});
				}

				// Compute initial zoom ranges (clipping outliers, floored at zero)
				const allReturns = currentVaults.map((v) => v.three_months_cagr! * 100);
				const allTvl = currentVaults.map((v) => v.current_nav!);
				const xRange = computeAxisRange(allReturns);
				const yRange = computeAxisRange(allTvl, true);
				xRange[0] = Math.max(xRange[0], 0);
				yRange[0] = Math.max(yRange[0], Math.log10(minTvl));

				const layout = {
					xaxis: {
						title: 'Three-month returns, annualised (%)',
						range: xRange,
						zeroline: true,
						zerolinecolor: 'rgba(255,255,255,0.2)',
						gridcolor: 'rgba(255,255,255,0.1)',
						color: 'rgba(255,255,255,0.7)'
					},
					yaxis: {
						title: 'TVL (USD)',
						type: 'log',
						range: yRange,
						gridcolor: 'rgba(255,255,255,0.1)',
						color: 'rgba(255,255,255,0.7)'
					},
					paper_bgcolor: 'transparent',
					plot_bgcolor: 'transparent',
					font: { color: 'rgba(255,255,255,0.7)' },
					legend: {
						title: { text: 'Risk level' },
						orientation: 'h' as const,
						yanchor: 'top' as const,
						y: -0.15,
						xanchor: 'center' as const,
						x: 0.5
					},
					height: 600,
					margin: { t: 20, r: 20, b: 100, l: 80 },
					dragmode: 'zoom' as const,
					autosize: true
				};

				const config = {
					responsive: true,
					displayModeBar: true,
					scrollZoom: true,
					modeBarButtonsToRemove: ['lasso2d', 'select2d']
				};

				if (destroyed) return;

				await Plotly.newPlot(chartContainer, traces, layout, config);

				chartContainer.on('plotly_click', (data: any) => {
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

<div class="scatter-plot-wrapper" data-testid="vault-scatter-plot">
	<div class="controls">
		<label>
			Min TVL:
			<select bind:value={minTvl}>
				{#each tvlOptions as { value, label } (value)}
					<option {value}>{label}</option>
				{/each}
			</select>
		</label>
	</div>

	{#if loading}
		<div class="loading">
			<Spinner size="60" />
			<p>Loading chart...</p>
		</div>
	{/if}

	{#if error}
		<div class="error">
			<p>{error}</p>
		</div>
	{/if}

	<div bind:this={chartContainer} class="chart-container" class:obscured={loading || !!error}></div>
</div>

<style>
	.scatter-plot-wrapper {
		position: relative;
		width: 100%;
		min-height: 500px;
	}

	.controls {
		display: flex;
		gap: 1rem;
		align-items: center;
		padding-bottom: 0.75rem;
		font: var(--f-ui-md-medium);
		color: var(--c-text-light);

		select {
			margin-left: 0.25rem;
			padding: 0.25rem 0.5rem;
			background: var(--c-background-accent-1);
			color: var(--c-text);
			border: 1px solid var(--c-border);
			border-radius: var(--radius-md);
			font: var(--f-ui-md-medium);
		}
	}

	.loading {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		min-height: 500px;
		color: var(--c-text-light);
	}

	.error {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 500px;
		color: var(--c-error);
	}

	.chart-container {
		width: 100%;
		min-height: 500px;

		&.obscured {
			visibility: hidden;
			position: absolute;
			inset: 0;
		}
	}
</style>

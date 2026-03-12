<!--
@component
Line chart showing vaults sorted by APY% (descending) on the X-axis,
with cumulative TVL on the Y-axis. As you move right (lower APY),
cumulative TVL grows. Plotly.js is loaded dynamically from CDN.

@example
```svelte
  <CumulativeTvlApyChart vaults={topVaults.vaults} {savingsRate} {treasuryRate} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { ParamSchema } from '$lib/helpers/url-search-state';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import {
		loadPlotly,
		buildChartConfig,
		chartFontFamily,
		chartTextColor,
		chartGridColor,
		chartAxisBorder
	} from '$lib/scatter-plot/helpers';
	import { deserialiseSearchParams, serialiseSearchParams } from '$lib/helpers/url-search-state';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	const MAX_APY_THRESHOLD = 10; // 1000%
	const LINEAR_APY_CAP = 15; // Cap X axis at 15% in linear mode for readability
	const MIN_APY_CHART_VALUE = 0.01; // Floor for log axis: 0.01% (used for display only)

	interface Props {
		vaults: VaultInfo[];
		savingsRate: number | null;
		treasuryRate: number | null;
		dataLoading?: boolean;
	}

	let { vaults, savingsRate, treasuryRate, dataLoading = false }: Props = $props();

	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const timeWindows = [
		{ value: '1m', label: '1 month' },
		{ value: '3m', label: '3 months' },
		{ value: '6m', label: '6 months' },
		{ value: '1y', label: '1 year' },
		{ value: 'all', label: 'All time' }
	] as const;

	type TimeWindow = (typeof timeWindows)[number]['value'];

	const searchParamsSchema = {
		tvl: { type: 'number', defaultValue: 50_000 },
		window: { type: 'string', defaultValue: '1m', options: timeWindows.map((w) => w.value) },
		protocols: { type: 'string', defaultValue: '' },
		log: { type: 'string', defaultValue: '1', options: ['0', '1'] }
	} as const satisfies ParamSchema;

	let urlState = $derived(deserialiseSearchParams(page.url.searchParams, searchParamsSchema));

	let minTvl = $derived(urlState.tvl);
	let selectedWindow = $derived(urlState.window as TimeWindow);
	let selectedProtocols = $derived(new Set(urlState.protocols ? urlState.protocols.split(',') : []));
	let logAxes = $derived(urlState.log === '1');

	function updateUrl(overrides: Partial<typeof urlState>) {
		const current = deserialiseSearchParams(page.url.searchParams, searchParamsSchema);
		const updated = { ...current, ...overrides };
		const qs = serialiseSearchParams(updated, searchParamsSchema);
		goto('?' + qs, { replaceState: true, noScroll: true, keepFocus: true });
	}

	/**
	 * Get the CAGR value for a vault based on the selected time window.
	 * Uses top-level fields for 1m/3m/lifetime; period_results for 6m/1y.
	 */
	function getVaultCagr(v: VaultInfo, window: TimeWindow): number | null {
		switch (window) {
			case '1m':
				return v.one_month_cagr_net ?? v.one_month_cagr;
			case '3m':
				return v.three_months_cagr_net ?? v.three_months_cagr;
			case '6m': {
				const period = v.period_results?.find((p) => p.period.toLowerCase() === '6m');
				return period?.cagr_net ?? period?.cagr_gross ?? null;
			}
			case '1y': {
				const period = v.period_results?.find((p) => p.period.toLowerCase() === '1y');
				return period?.cagr_net ?? period?.cagr_gross ?? null;
			}
			case 'all':
				return v.cagr_net ?? v.cagr;
		}
	}

	/** All eligible vaults sorted by APY descending. */
	let allEligible = $derived(
		vaults
			.filter((v) => {
				if (isBlacklisted(v)) return false;
				if (v.current_nav == null || v.current_nav < minTvl) return false;
				const apy = getVaultCagr(v, selectedWindow);
				return apy != null && apy <= MAX_APY_THRESHOLD;
			})
			.toSorted((a, b) => {
				const apyA = getVaultCagr(a, selectedWindow) ?? 0;
				const apyB = getVaultCagr(b, selectedWindow) ?? 0;
				return apyB - apyA;
			})
	);

	/** Unique protocols with vault counts, sorted by count desc then name. */
	let protocolOptions = $derived(() => {
		const counts = new Map<string, number>();
		for (const v of allEligible) {
			const p = v.protocol ?? 'Unknown';
			counts.set(p, (counts.get(p) ?? 0) + 1);
		}
		return [...counts.entries()]
			.toSorted(([aName, aCount], [bName, bCount]) => bCount - aCount || aName.localeCompare(bName))
			.map(([name, count]) => ({ name, count }));
	});

	/** Toggle a protocol in the selection set. */
	function toggleProtocol(name: string) {
		const allActive = selectedProtocols.size === 0;
		const next = new Set(selectedProtocols);

		if (allActive) {
			next.add(name);
		} else if (next.has(name)) {
			next.delete(name);
		} else {
			next.add(name);
		}

		updateUrl({ protocols: [...next].join(',') });
	}

	/** Vaults filtered by selected protocols. */
	let protocolFiltered = $derived(
		selectedProtocols.size === 0
			? allEligible
			: allEligible.filter((v) => selectedProtocols.has(v.protocol ?? 'Unknown'))
	);

	let displayedVaults = $derived(protocolFiltered);

	/** Total TVL across displayed vaults. */
	let totalTvl = $derived(displayedVaults.reduce((sum, v) => sum + (v.current_nav ?? 0), 0));

	/**
	 * Compute X (APY%) and Y (cumulative TVL) for the chart.
	 * Vaults are already sorted by APY descending, so cumulative TVL rises left→right.
	 */
	function computeChartData(displayed: VaultInfo[], window: TimeWindow) {
		const apyValues: number[] = [];
		const realApyValues: number[] = [];
		const cumulativeTvl: number[] = [];
		const labels: string[] = [];
		const vaultSlugs: string[] = [];
		const individualTvl: number[] = [];
		const chains: string[] = [];
		const protocols: string[] = [];

		let runningTvl = 0;

		for (const v of displayed) {
			const apy = getVaultCagr(v, window)!;
			const apyPct = apy * 100;
			const tvl = v.current_nav!;
			runningTvl += tvl;

			apyValues.push(Math.max(apyPct, MIN_APY_CHART_VALUE));
			realApyValues.push(apyPct);
			cumulativeTvl.push(runningTvl);
			labels.push(v.name);
			individualTvl.push(tvl);
			vaultSlugs.push(v.vault_slug);
			chains.push(v.chain ?? 'Unknown');
			protocols.push(v.protocol ?? 'Unknown');
		}

		return { apyValues, realApyValues, cumulativeTvl, labels, vaultSlugs, individualTvl, chains, protocols };
	}

	function formatUsd(value: number): string {
		if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
		if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
		if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
		return `$${value.toFixed(0)}`;
	}

	$effect(() => {
		if (dataLoading) {
			loading = true;
			error = null;
			return;
		}

		const currentDisplayed = displayedVaults;
		const timeWindow = selectedWindow;
		const useLogAxes = logAxes;
		let destroyed = false;

		(async () => {
			try {
				loading = true;
				error = null;

				const Plotly = await loadPlotly();
				if (destroyed) return;

				if (currentDisplayed.length === 0) {
					error = 'No vaults with both TVL and CAGR data available for this time window.';
					loading = false;
					return;
				}

				const { apyValues, realApyValues, cumulativeTvl, labels, vaultSlugs, individualTvl, chains, protocols } =
					computeChartData(currentDisplayed, timeWindow);

				const windowLabel = timeWindows.find((w) => w.value === timeWindow)!.label;

				const chartTotalTvl = cumulativeTvl.at(-1) ?? 0;

				const trace = {
					x: apyValues,
					y: cumulativeTvl,
					name: 'Cumulative TVL',
					type: 'scatter' as const,
					mode: 'lines+markers' as const,
					line: { color: '#22c55e', width: 2 },
					marker: { color: '#22c55e', size: 4 },
					fill: 'tozeroy' as const,
					fillcolor: 'rgba(34,197,94,0.15)',
					hoverlabel: { bgcolor: '#b45309', font: { color: 'white', size: 14 }, bordercolor: '#92400e' },
					customdata: vaultSlugs.map((slug) => `/trading-view/vaults/${slug}`),
					hovertemplate: labels.map((name, i) => {
						const tvlEarningBetter = cumulativeTvl[i] - individualTvl[i];
						const tvlEarningLess = chartTotalTvl - cumulativeTvl[i];
						return [
							`<b>${name}</b>`,
							`${chains[i]} · ${protocols[i]}`,
							`Returns annualised (${windowLabel}): ${realApyValues[i].toFixed(1)}%`,
							`TVL earning less than this: ${formatUsd(tvlEarningLess)} (${chartTotalTvl > 0 ? ((tvlEarningLess / chartTotalTvl) * 100).toFixed(1) : '0.0'}%)`,
							`TVL earning better than this: ${formatUsd(tvlEarningBetter)} (${chartTotalTvl > 0 ? ((tvlEarningBetter / chartTotalTvl) * 100).toFixed(1) : '0.0'}%)`,
							'<extra></extra>'
						].join('<br>');
					})
				};

				const axisType = useLogAxes ? ('log' as const) : ('linear' as const);
				const isMobile = window.innerWidth <= 768;

				const layout = {
					xaxis: {
						title: isMobile ? undefined : '<b>Returns (annualised)</b>',
						type: axisType,
						gridcolor: chartGridColor,
						color: chartTextColor,
						ticksuffix: '%',
						...chartAxisBorder,
						...(useLogAxes ? { autorange: 'reversed' as const, dtick: 1 } : { range: [LINEAR_APY_CAP, 0] })
					},
					yaxis: {
						title: isMobile ? undefined : '<b>TVL</b>',
						type: axisType,
						side: 'right' as const,
						gridcolor: chartGridColor,
						color: chartTextColor,
						...chartAxisBorder,
						...(useLogAxes
							? {
									tickvals: [100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000],
									ticktext: ['$100k', '$1M', '$10M', '$100M', '$1B', '$10B']
								}
							: {})
					},
					shapes: [
						...(treasuryRate
							? [
									{
										type: 'line' as const,
										x0: treasuryRate,
										x1: treasuryRate,
										y0: 0,
										y1: 1,
										xref: 'x' as const,
										yref: 'paper' as const,
										line: { color: 'rgba(200,120,0,0.8)', width: 3 }
									}
								]
							: []),
						...(savingsRate
							? [
									{
										type: 'line' as const,
										x0: savingsRate,
										x1: savingsRate,
										y0: 0,
										y1: 1,
										xref: 'x' as const,
										yref: 'paper' as const,
										line: { color: 'rgba(200,120,0,0.8)', width: 3 }
									}
								]
							: [])
					],
					paper_bgcolor: 'transparent',
					plot_bgcolor: 'transparent',
					font: { family: chartFontFamily, color: chartTextColor },
					showlegend: false,
					height: 600,
					margin: isMobile ? { t: 5, r: 50, b: 30, l: 5 } : { t: 20, r: 100, b: 80, l: 40 },
					dragmode: isMobile ? (false as const) : ('zoom' as const),
					autosize: true,
					hovermode: 'closest' as const
				};

				const traces: any[] = [trace];

				/** Distribute N points along the Y range (log or linear). */
				function distributeYPoints(yMin: number, yMax: number, count: number): number[] {
					if (useLogAxes) {
						const logMin = Math.log10(yMin);
						const logMax = Math.log10(yMax);
						return Array.from({ length: count }, (_, i) =>
							Math.pow(10, logMin + ((logMax - logMin) * i) / (count - 1))
						);
					}
					return Array.from({ length: count }, (_, i) => yMin + ((yMax - yMin) * i) / (count - 1));
				}

				if (treasuryRate) {
					let tvlBetter = 0;
					let tvlWorse = 0;
					for (let i = 0; i < realApyValues.length; i++) {
						if (realApyValues[i] > treasuryRate) {
							tvlBetter += individualTvl[i];
						} else {
							tvlWorse += individualTvl[i];
						}
					}
					const totalTvl = tvlBetter + tvlWorse;
					const pctBetter = totalTvl > 0 ? ((tvlBetter / totalTvl) * 100).toFixed(1) : '0.0';
					const pctWorse = totalTvl > 0 ? ((tvlWorse / totalTvl) * 100).toFixed(1) : '0.0';

					const yMin = Math.min(...cumulativeTvl);
					const yMax = Math.max(...cumulativeTvl);
					const yPoints = distributeYPoints(yMin, yMax, 20);
					traces.push({
						x: yPoints.map(() => treasuryRate),
						y: yPoints,
						mode: 'markers' as const,
						marker: { size: 1, color: 'rgba(0,0,0,0)', opacity: 0 },
						customdata: yPoints.map(() => '/glossary/risk-free-rate'),
						hovertemplate: [
							`<b>US Treasury note rate (${treasuryRate.toFixed(1)}%)</b>`,
							`The risk-free benchmark.`,
							``,
							`Earning better: ${formatUsd(tvlBetter)} (${pctBetter}%)`,
							`Earning less: ${formatUsd(tvlWorse)} (${pctWorse}%)`,
							``,
							`<i>Click for more information</i>`,
							`<extra></extra>`
						].join('<br>'),
						hoverlabel: { bgcolor: '#b45309', font: { color: 'white', size: 14 }, bordercolor: '#92400e' },
						showlegend: false
					});
				}

				if (savingsRate) {
					let tvlBetter = 0;
					let tvlWorse = 0;
					for (let i = 0; i < realApyValues.length; i++) {
						if (realApyValues[i] > savingsRate) {
							tvlBetter += individualTvl[i];
						} else {
							tvlWorse += individualTvl[i];
						}
					}
					const total = tvlBetter + tvlWorse;
					const pctBetter = total > 0 ? ((tvlBetter / total) * 100).toFixed(1) : '0.0';
					const pctWorse = total > 0 ? ((tvlWorse / total) * 100).toFixed(1) : '0.0';

					const yMin = Math.min(...cumulativeTvl);
					const yMax = Math.max(...cumulativeTvl);
					const yPoints = distributeYPoints(yMin, yMax, 20);
					traces.push({
						x: yPoints.map(() => savingsRate),
						y: yPoints,
						mode: 'markers' as const,
						marker: { size: 1, color: 'rgba(0,0,0,0)', opacity: 0 },
						customdata: yPoints.map(() => '/glossary/fdic-national-rate'),
						hovertemplate: [
							`<b>US bank savings rate (${savingsRate.toFixed(2)}%)</b>`,
							`Average yield on a US bank savings account.`,
							``,
							`Earning better: ${formatUsd(tvlBetter)} (${pctBetter}%)`,
							`Earning less: ${formatUsd(tvlWorse)} (${pctWorse}%)`,
							``,
							`<i>Click for more information</i>`,
							`<extra></extra>`
						].join('<br>'),
						hoverlabel: { bgcolor: '#b45309', font: { color: 'white', size: 14 }, bordercolor: '#92400e' },
						showlegend: false
					});
				}

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

<ScatterPlotShell bind:chartContainer {loading} {error} {minTvl} onMinTvlChange={(v) => updateUrl({ tvl: v })}>
	{#snippet extraControls()}
		<label>
			Returns lookback:
			<select value={selectedWindow} onchange={(e) => updateUrl({ window: e.currentTarget.value })}>
				{#each timeWindows as { value, label } (value)}
					<option {value} selected={value === selectedWindow}>{label}</option>
				{/each}
			</select>
		</label>
		<label class="checkbox-label">
			<input type="checkbox" checked={logAxes} onchange={() => updateUrl({ log: logAxes ? '0' : '1' })} />
			Logarithmic axes
		</label>
	{/snippet}
	{#snippet belowChart()}
		<p class="protocol-label">Select vault protocols</p>
		<div class="protocol-chips">
			{#each protocolOptions() as { name, count } (name)}
				<button
					class="chip"
					class:active={selectedProtocols.size === 0 || selectedProtocols.has(name)}
					onclick={() => toggleProtocol(name)}
				>
					{name} ({count})
				</button>
			{/each}
		</div>
		<p class="vault-count">
			Showing {displayedVaults.length} of {allEligible.length} vault{allEligible.length === 1 ? '' : 's'}
			· Total TVL: {formatUsd(totalTvl)}
		</p>
	{/snippet}
</ScatterPlotShell>

<style>
	.protocol-label {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-bottom: 0.25rem;
		margin-top: 0.75rem;
	}

	.protocol-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		justify-content: center;
	}

	.chip {
		padding: 0.25rem 0.625rem;
		border: 1px solid var(--c-border);
		border-radius: var(--radius-md);
		background: transparent;
		color: var(--c-text-extra-light);
		font: var(--f-ui-xs-roman);
		cursor: pointer;
		transition: all 0.15s ease;
		opacity: 0.4;

		&.active {
			background: var(--c-box-3);
			color: var(--c-text);
			opacity: 1;
		}

		&:hover {
			border-color: var(--c-text-light);
		}
	}

	.checkbox-label {
		display: flex;
		align-items: center;
		gap: 0.375rem;
		cursor: pointer;
	}

	.vault-count {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-top: 0.75rem;
	}
</style>

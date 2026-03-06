<!--
@component
Line chart showing vaults sorted by APY% (descending) on the X-axis,
with cumulative TVL on the Y-axis. As you move right (lower APY),
cumulative TVL grows. Plotly.js is loaded dynamically from CDN.

@example
```svelte
  <CumulativeTvlApyChart vaults={topVaults.vaults} />
```
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import type { ParamSchema } from '$lib/helpers/url-search-state';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import { loadPlotly, buildChartConfig } from '$lib/scatter-plot/helpers';
	import { deserialiseSearchParams, serialiseSearchParams } from '$lib/helpers/url-search-state';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import ScatterPlotShell from '$lib/scatter-plot/ScatterPlotShell.svelte';

	const MAX_APY_THRESHOLD = 10; // 1000%
	const MIN_APY_THRESHOLD = 0.001; // 0.1%

	interface Props {
		vaults: VaultInfo[];
	}

	let { vaults }: Props = $props();

	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let loading = $state(true);
	let error = $state<string | null>(null);

	const vaultLimitOptions = [
		{ value: 25, label: '25' },
		{ value: 50, label: '50' },
		{ value: 100, label: '100' },
		{ value: 200, label: '200' },
		{ value: 0, label: 'All' }
	] as const;

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
		top: { type: 'number', defaultValue: 0 },
		window: { type: 'string', defaultValue: '1m', options: timeWindows.map((w) => w.value) },
		protocols: { type: 'string', defaultValue: '' }
	} as const satisfies ParamSchema;

	let urlState = $derived(deserialiseSearchParams(page.url.searchParams, searchParamsSchema));

	let minTvl = $derived(urlState.tvl);
	let maxVaults = $derived(urlState.top);
	let selectedWindow = $derived(urlState.window as TimeWindow);
	let selectedProtocols = $derived(new Set(urlState.protocols ? urlState.protocols.split(',') : []));

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
				return apy != null && apy >= MIN_APY_THRESHOLD && apy <= MAX_APY_THRESHOLD;
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

	/** Displayed vaults (limited to maxVaults). */
	let displayedVaults = $derived(maxVaults > 0 ? protocolFiltered.slice(0, maxVaults) : protocolFiltered);

	/**
	 * Compute X (APY%) and Y (cumulative TVL) for the chart.
	 * Vaults are already sorted by APY descending, so cumulative TVL rises left→right.
	 */
	function computeChartData(displayed: VaultInfo[], window: TimeWindow) {
		const apyValues: number[] = [];
		const cumulativeTvl: number[] = [];
		const labels: string[] = [];
		const vaultSlugs: string[] = [];
		const individualTvl: number[] = [];
		const chains: string[] = [];
		const protocols: string[] = [];

		let runningTvl = 0;

		for (const v of displayed) {
			const apy = getVaultCagr(v, window)!;
			const tvl = v.current_nav!;
			runningTvl += tvl;

			apyValues.push(apy * 100);
			cumulativeTvl.push(runningTvl);
			labels.push(v.name);
			individualTvl.push(tvl);
			vaultSlugs.push(v.vault_slug);
			chains.push(v.chain ?? 'Unknown');
			protocols.push(v.protocol ?? 'Unknown');
		}

		return { apyValues, cumulativeTvl, labels, vaultSlugs, individualTvl, chains, protocols };
	}

	function formatUsd(value: number): string {
		if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
		if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
		if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
		return `$${value.toFixed(0)}`;
	}

	$effect(() => {
		const currentDisplayed = displayedVaults;
		const timeWindow = selectedWindow;
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

				const { apyValues, cumulativeTvl, labels, vaultSlugs, individualTvl, chains, protocols } = computeChartData(
					currentDisplayed,
					timeWindow
				);

				const windowLabel = timeWindows.find((w) => w.value === timeWindow)!.label;

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
					customdata: vaultSlugs.map((slug) => `/trading-view/vaults/${slug}`),
					hovertemplate: labels.map((name, i) => {
						return [
							`<b>${name}</b>`,
							`${chains[i]} · ${protocols[i]}`,
							`CAGR (${windowLabel}): ${apyValues[i].toFixed(1)}%`,
							`TVL: ${formatUsd(individualTvl[i])}`,
							`Cumulative TVL: ${formatUsd(cumulativeTvl[i])}`,
							'<extra></extra>'
						].join('<br>');
					})
				};

				const layout = {
					xaxis: {
						title: `CAGR % (${windowLabel})`,
						type: 'log' as const,
						gridcolor: 'rgba(255,255,255,0.1)',
						color: 'rgba(255,255,255,0.7)',
						ticksuffix: '%',
						autorange: true as const
					},
					yaxis: {
						title: 'Cumulative TVL (USD)',
						type: 'log' as const,
						gridcolor: 'rgba(255,255,255,0.1)',
						color: '#22c55e',
						tickvals: [100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000],
						ticktext: ['$100k', '$1M', '$10M', '$100M', '$1B', '$10B']
					},
					paper_bgcolor: 'transparent',
					plot_bgcolor: 'transparent',
					font: { color: 'rgba(255,255,255,0.7)' },
					showlegend: false,
					height: 600,
					margin: { t: 20, r: 40, b: 80, l: 100 },
					dragmode: 'zoom' as const,
					autosize: true,
					hovermode: 'closest' as const
				};

				const config = buildChartConfig();

				if (destroyed) return;

				await Plotly.newPlot(chartContainer, [trace], layout, config);

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
			Show top:
			<select value={maxVaults} onchange={(e) => updateUrl({ top: Number(e.currentTarget.value) })}>
				{#each vaultLimitOptions as { value, label } (value)}
					<option {value} selected={value === maxVaults}>{label}</option>
				{/each}
			</select>
		</label>
		<label>
			CAGR window:
			<select value={selectedWindow} onchange={(e) => updateUrl({ window: e.currentTarget.value })}>
				{#each timeWindows as { value, label } (value)}
					<option {value} selected={value === selectedWindow}>{label}</option>
				{/each}
			</select>
		</label>
	{/snippet}
	{#snippet belowChart()}
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
		</p>
	{/snippet}
</ScatterPlotShell>

<style>
	.protocol-chips {
		display: flex;
		flex-wrap: wrap;
		gap: 0.375rem;
		justify-content: center;
		margin-top: 0.75rem;
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

	.vault-count {
		text-align: center;
		font: var(--f-ui-sm-roman);
		color: var(--c-text-extra-light);
		margin-top: 0.75rem;
	}
</style>

<!--
@component
Simplified cumulative TVL/APY chart for the frontpage. No controls — uses
fixed defaults (1-month window, $50k min TVL, log axes). Plotly.js is
loaded dynamically from CDN.
-->
<script lang="ts">
	import type { VaultInfo } from '$lib/top-vaults/schemas';
	import { isBlacklisted } from '$lib/top-vaults/helpers';
	import {
		loadPlotly,
		chartFontFamily,
		chartTextColor,
		chartGridColor,
		chartAxisBorder
	} from '$lib/scatter-plot/helpers';
	import { goto } from '$app/navigation';
	import Spinner from '$lib/components/Spinner.svelte';

	const MIN_TVL = 50_000;
	const MAX_APY_THRESHOLD = 10; // 1000%
	const MIN_APY_CHART_VALUE = 0.01;

	interface Props {
		vaults: VaultInfo[];
		savingsRate: number | null;
		treasuryRate: number | null;
	}

	let { vaults, savingsRate, treasuryRate }: Props = $props();

	let chartContainer = $state<HTMLDivElement>(undefined as unknown as HTMLDivElement);
	let loading = $state(true);
	let error = $state<string | null>(null);

	/** Get 1-month CAGR for a vault. */
	function getCagr(v: VaultInfo): number | null {
		return v.one_month_cagr_net ?? v.one_month_cagr;
	}

	let eligible = $derived(
		vaults
			.filter((v) => {
				if (isBlacklisted(v)) return false;
				if (v.current_nav == null || v.current_nav < MIN_TVL) return false;
				const apy = getCagr(v);
				return apy != null && apy <= MAX_APY_THRESHOLD;
			})
			.toSorted((a, b) => (getCagr(b) ?? 0) - (getCagr(a) ?? 0))
	);

	function formatUsd(value: number): string {
		if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
		if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
		if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
		return `$${value.toFixed(0)}`;
	}

	$effect(() => {
		const displayed = eligible;
		let destroyed = false;

		(async () => {
			try {
				loading = true;
				error = null;

				const Plotly = await loadPlotly();
				if (destroyed) return;

				if (displayed.length === 0) {
					error = 'No vault data available.';
					loading = false;
					return;
				}

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
					const apyPct = getCagr(v)! * 100;
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

				const totalTvl = runningTvl;

				const trace = {
					x: apyValues,
					y: cumulativeTvl,
					name: 'Cumulative TVL',
					type: 'scatter' as const,
					mode: 'lines+markers' as const,
					line: { color: '#22c55e', width: 2 },
					marker: { color: '#22c55e', size: 3 },
					fill: 'tozeroy' as const,
					fillcolor: 'rgba(34,197,94,0.15)',
					hoverlabel: { bgcolor: '#b45309', font: { color: 'white', size: 14 }, bordercolor: '#92400e' },
					customdata: vaultSlugs.map((slug) => `/trading-view/vaults/${slug}`),
					hovertemplate: labels.map((name, i) => {
						const tvlEarningBetter = cumulativeTvl[i] - individualTvl[i];
						const tvlEarningLess = totalTvl - cumulativeTvl[i];
						return [
							`<b>${name}</b>`,
							`${chains[i]} · ${protocols[i]}`,
							`Returns (annualised): ${realApyValues[i].toFixed(1)}%`,
							`TVL earning less than this: ${formatUsd(tvlEarningLess)} (${totalTvl > 0 ? ((tvlEarningLess / totalTvl) * 100).toFixed(1) : '0.0'}%)`,
							`TVL earning better than this: ${formatUsd(tvlEarningBetter)} (${totalTvl > 0 ? ((tvlEarningBetter / totalTvl) * 100).toFixed(1) : '0.0'}%)`,
							'<extra></extra>'
						].join('<br>');
					})
				};

				const isMobile = window.innerWidth <= 768;

				const layout = {
					xaxis: {
						title: isMobile
							? undefined
							: { text: '<b>Returns (last month annualised)</b>', font: { color: chartTextColor } },
						type: 'log' as const,
						gridcolor: chartGridColor,
						color: chartTextColor,
						ticksuffix: '%',
						dtick: 1,
						autorange: 'reversed' as const,
						...chartAxisBorder
					},
					yaxis: {
						title: isMobile ? undefined : { text: '<b>TVL</b>', font: { color: chartTextColor } },
						side: 'right' as const,
						type: 'log' as const,
						gridcolor: chartGridColor,
						color: chartTextColor,
						tickvals: [100_000, 1_000_000, 10_000_000, 100_000_000, 1_000_000_000, 10_000_000_000],
						ticktext: ['$100k', '$1M', '$10M', '$100M', '$1B', '$10B'],
						...chartAxisBorder
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
					height: 400,
					margin: isMobile ? { t: 5, r: 40, b: 30, l: 5 } : { t: 10, r: 80, b: 60, l: 30 },
					dragmode: false as const,
					autosize: true,
					hovermode: 'closest' as const
				};

				const traces: any[] = [trace];

				function distributeYPoints(yMin: number, yMax: number, count: number): number[] {
					const logMin = Math.log10(yMin);
					const logMax = Math.log10(yMax);
					return Array.from({ length: count }, (_, i) => Math.pow(10, logMin + ((logMax - logMin) * i) / (count - 1)));
				}

				if (treasuryRate) {
					let tvlBetter = 0;
					let tvlWorse = 0;
					for (let i = 0; i < realApyValues.length; i++) {
						if (realApyValues[i] > treasuryRate) tvlBetter += individualTvl[i];
						else tvlWorse += individualTvl[i];
					}
					const total = tvlBetter + tvlWorse;
					const pctBetter = total > 0 ? ((tvlBetter / total) * 100).toFixed(1) : '0.0';
					const pctWorse = total > 0 ? ((tvlWorse / total) * 100).toFixed(1) : '0.0';
					const yPoints = distributeYPoints(Math.min(...cumulativeTvl), Math.max(...cumulativeTvl), 20);
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
						if (realApyValues[i] > savingsRate) tvlBetter += individualTvl[i];
						else tvlWorse += individualTvl[i];
					}
					const total = tvlBetter + tvlWorse;
					const pctBetter = total > 0 ? ((tvlBetter / total) * 100).toFixed(1) : '0.0';
					const pctWorse = total > 0 ? ((tvlWorse / total) * 100).toFixed(1) : '0.0';
					const yPoints = distributeYPoints(Math.min(...cumulativeTvl), Math.max(...cumulativeTvl), 20);
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

				const config = {
					responsive: true,
					displayModeBar: false,
					scrollZoom: false
				};
				if (destroyed) return;

				await Plotly.newPlot(chartContainer, traces, layout, config);

				(chartContainer as any).on('plotly_click', (data: any) => {
					const point = data.points?.[0];
					if (point?.customdata) goto(point.customdata);
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

<div class="ecosystem-chart">
	{#if loading}
		<div class="loading-overlay">
			<Spinner size="48" />
		</div>
	{/if}
	{#if error}
		<p class="error">{error}</p>
	{/if}
	<div bind:this={chartContainer} class="chart" class:obscured={loading || !!error}></div>
</div>

<style>
	.ecosystem-chart {
		position: relative;
		min-height: 400px;
		max-width: 960px;
		margin-inline: auto;
	}

	.loading-overlay {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		z-index: 1;
	}

	.chart {
		width: 100%;

		&.obscured {
			visibility: hidden;
		}
	}

	.error {
		text-align: center;
		color: var(--c-text-extra-light);
		font: var(--f-ui-sm-roman);
	}
</style>

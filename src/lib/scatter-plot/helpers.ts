import type { VaultInfo } from '$lib/top-vaults/schemas';
import { resolveVaultDetails } from '$lib/top-vaults/helpers';
import { getChain } from '$lib/helpers/chain';

export const tvlOptions = [
	{ value: 50_000, label: '$50k' },
	{ value: 100_000, label: '$100k' },
	{ value: 250_000, label: '$250k' },
	{ value: 500_000, label: '$500k' },
	{ value: 1_000_000, label: '$1M' },
	{ value: 2_000_000, label: '$2M' }
];

/**
 * Calculate percentile value from a sorted numeric array.
 * @param sorted - Array of numbers in ascending order
 * @param p - Percentile (0-100)
 */
export function percentile(sorted: number[], p: number): number {
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
export function computeAxisRange(values: number[], isLog = false): [number, number] {
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
export function loadPlotly(): Promise<any> {
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

/** Format a decimal return as a percentage string. */
export function formatReturn(value: number | null | undefined): string {
	return value != null ? `${(value * 100).toFixed(1)}%` : 'n/a';
}

/** Build the standard marker style for a scatter trace. */
export function buildMarker(color: string) {
	return {
		color,
		size: 8,
		opacity: 0.8,
		line: { width: 1, color: 'rgba(255,255,255,0.3)' }
	};
}

/**
 * Build the Plotly layout object for a vault scatter plot.
 * @param legendTitle - Title for the legend (e.g. "Technical risk" or "Protocol")
 * @param xRange - Pre-computed X axis range
 * @param yRange - Pre-computed Y axis range (log10)
 */
export function buildChartLayout(legendTitle: string, xRange: [number, number], yRange: [number, number]) {
	return {
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
			type: 'log' as const,
			range: yRange,
			gridcolor: 'rgba(255,255,255,0.1)',
			color: 'rgba(255,255,255,0.7)'
		},
		paper_bgcolor: 'transparent',
		plot_bgcolor: 'transparent',
		font: { color: 'rgba(255,255,255,0.7)' },
		legend: {
			title: { text: legendTitle },
			orientation: 'h' as const,
			yanchor: 'top' as const,
			y: -0.15,
			xanchor: 'center' as const,
			x: 0.5
		} as Record<string, any>,
		height: 600,
		margin: { t: 20, r: 20, b: 100, l: 80 },
		dragmode: 'zoom' as const,
		autosize: true
	};
}

/** Build the standard Plotly config object. */
export function buildChartConfig() {
	return {
		responsive: true,
		displayModeBar: true,
		scrollZoom: true,
		modeBarButtonsToRemove: ['lasso2d', 'select2d']
	};
}

/**
 * Build the base hover text lines shared by both risk and protocol views.
 * Returns an array of HTML strings; callers insert view-specific lines.
 */
export function buildBaseHoverLines(v: VaultInfo): string[] {
	const chainName = getChain(v.chain_id)?.name ?? `Chain ${v.chain_id}`;
	const tvl = `$${v.current_nav!.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
	return [
		`<b>${v.name}</b>`,
		v.protocol,
		chainName,
		`TVL: ${tvl}`,
		`1M return (ann.): ${formatReturn(v.one_month_cagr)}`,
		`3M return (ann.): ${formatReturn(v.three_months_cagr)}`
	];
}

/**
 * Build a single Plotly scatter trace from a group of vaults.
 * @param group - Vaults in this trace
 * @param name - Legend label
 * @param color - Marker colour
 * @param formatHoverText - Function to build hover HTML for each vault
 */
export function buildTrace(group: VaultInfo[], name: string, color: string, formatHoverText: (v: VaultInfo) => string) {
	return {
		x: group.map((v) => v.three_months_cagr! * 100),
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
 * Compute X and Y axis ranges from vaults, clipping outliers and flooring at sensible minimums.
 * @param vaults - Eligible vaults with non-null three_months_cagr and current_nav
 * @param minTvl - Minimum TVL threshold for Y axis floor
 */
export function computeScatterRanges(vaults: VaultInfo[], minTvl: number) {
	const allReturns = vaults.map((v) => v.three_months_cagr! * 100);
	const allTvl = vaults.map((v) => v.current_nav!);
	const xRange = computeAxisRange(allReturns);
	const yRange = computeAxisRange(allTvl, true);
	xRange[0] = Math.max(xRange[0], 0);
	yRange[0] = Math.max(yRange[0], Math.log10(minTvl));
	return { xRange, yRange };
}

/** Palette of 20 visually distinct colours for protocol grouping. */
export const protocolPalette = [
	'#13b1c0',
	'#22c55e',
	'#eab308',
	'#f97316',
	'#ef4444',
	'#8b5cf6',
	'#ec4899',
	'#06b6d4',
	'#84cc16',
	'#f59e0b',
	'#6366f1',
	'#14b8a6',
	'#e879f9',
	'#fb923c',
	'#38bdf8',
	'#a3e635',
	'#f43f5e',
	'#a78bfa',
	'#2dd4bf',
	'#fbbf24'
];

/** Grey used for "Other" and "Unknown" groups. */
export const greyColor = '#9ca3af';

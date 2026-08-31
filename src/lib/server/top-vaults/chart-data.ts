import { getLogoUrl } from '$lib/helpers/assets';
import { buildCumulativeTvlPoints } from '$lib/echarts/cumulative-tvl-apy';
import { getChain, getChainDisplayName } from '$lib/helpers/chain';
import {
	getProtocolDisplayName,
	getVaultProtocolDisplayName,
	hasSupportedProtocol,
	isBlacklisted,
	resolveVaultDetails
} from '$lib/top-vaults/helpers';
import type { VaultInfo } from '$lib/top-vaults/schemas';
import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';
import type {
	CumulativeChartData,
	CumulativeChartPoint,
	VaultChartPoint,
	VaultChartTrace,
	VaultScatterChartData
} from '$lib/vault-chart-data';

// Keep the established Plotly scatter palette stable while the grouping moves
// to the server.
const palette = [
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
const grey = '#9ca3af';

/** Parse a chart TVL threshold without allowing malformed query values to widen the dataset unexpectedly. */
export function parseChartMinTvl(value: string | null): number {
	const parsed = Number(value);
	return Number.isFinite(parsed) && parsed > 0 ? parsed : 50_000;
}

function returnLabel(value: number | null | undefined) {
	return value == null ? 'n/a' : `${(value * 100).toFixed(1)}%`;
}

function formatTvl(value: number) {
	return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
}

function yieldPoint(vault: VaultInfo, extra: string): VaultChartPoint {
	return {
		x: vault.three_months_cagr! * 100,
		y: vault.current_nav!,
		hover: [
			`<b>${vault.name}</b>`,
			getVaultProtocolDisplayName(vault),
			getChainDisplayName(vault.chain_id),
			extra,
			`TVL: ${formatTvl(vault.current_nav!)}`,
			`1M return (ann.): ${returnLabel(vault.one_month_cagr)}`,
			`3M return (ann.): ${returnLabel(vault.three_months_cagr)}`
		].join('<br>'),
		url: resolveVaultDetails(vault)
	};
}

function groupedTraces(
	vaults: VaultInfo[],
	nameFor: (vault: VaultInfo) => string,
	pointFor: (vault: VaultInfo) => VaultChartPoint,
	groupSmall: boolean
): VaultChartTrace[] {
	const groups = new Map<string, VaultInfo[]>();
	for (const vault of vaults) {
		const name = nameFor(vault);
		groups.set(name, [...(groups.get(name) ?? []), vault]);
	}
	const sorted = [...groups.entries()]
		.map(([name, items]) => ({ name, items }))
		.toSorted((a, b) => b.items.length - a.items.length || a.name.localeCompare(b.name));
	const major = groupSmall ? sorted.filter((group) => group.items.length > 2) : sorted;
	const small = groupSmall ? sorted.filter((group) => group.items.length <= 2).flatMap((group) => group.items) : [];
	const traces = major.map((group, index) => ({
		name: group.name,
		colour: palette[index % palette.length],
		points: group.items.map(pointFor)
	}));
	if (small.length) traces.push({ name: 'Other', colour: grey, points: small.map(pointFor) });
	return traces;
}

/** Build the complete, already-grouped payload for a yield scatter chart. */
export function buildYieldChartData(
	vaults: VaultInfo[],
	mode: 'risk' | 'chain' | 'protocol',
	minTvl: number
): VaultScatterChartData {
	const base = vaults.filter(
		(vault) =>
			!isBlacklisted(vault) &&
			vault.current_nav != null &&
			vault.current_nav >= minTvl &&
			vault.three_months_cagr != null
	);
	if (mode === 'risk') {
		const risks = [
			['Negligible', '#13b1c0'],
			['Minimal', '#22c55e'],
			['Low', '#eab308'],
			['High', '#f97316'],
			['Severe', '#ef4444'],
			['Dangerous', '#c62847']
		] as const;
		const traces: VaultChartTrace[] = risks.flatMap(([risk, colour]) => {
			const items = base.filter((vault) => vault.risk === risk);
			return items.length
				? [{ name: risk, colour, points: items.map((vault) => yieldPoint(vault, `Risk: ${risk}`)) }]
				: [];
		});
		const unknown = base.filter(
			(vault) => !risks.some(([risk]) => vault.risk === risk) && vault.three_months_cagr !== 0
		);
		if (unknown.length)
			traces.push({
				name: 'Unknown',
				colour: grey,
				points: unknown.map((vault) => yieldPoint(vault, 'Risk: Unknown'))
			});
		return { traces, pointCount: traces.reduce((total, trace) => total + trace.points.length, 0) };
	}
	if (mode === 'chain') {
		const included = base.filter((vault) => getChain(vault.chain_id));
		return {
			traces: groupedTraces(
				included,
				(vault) => getChain(vault.chain_id)!.name,
				(vault) => yieldPoint(vault, `Chain: ${getChainDisplayName(vault.chain_id)}`),
				true
			),
			pointCount: included.length,
			excludedCount: base.length - included.length
		};
	}
	const included = base.filter(hasSupportedProtocol);
	return {
		traces: groupedTraces(
			included,
			(vault) => getProtocolDisplayName(vault.protocol, vault.protocol_slug),
			(vault) => yieldPoint(vault, `Protocol: ${getVaultProtocolDisplayName(vault)}`),
			true
		),
		pointCount: included.length,
		excludedCount: base.length - included.length
	};
}

/** Build current/peak-TVL points after applying the selected server-side grouping. */
export function buildTvlChartData(
	vaults: VaultInfo[],
	colourBy: 'chain' | 'protocol',
	minTvl: number
): VaultScatterChartData {
	const base = vaults.filter(
		(vault) =>
			!isBlacklisted(vault) &&
			vault.current_nav != null &&
			vault.current_nav >= minTvl &&
			vault.peak_nav != null &&
			vault.peak_nav <= 50_000_000_000
	);
	const included = base.filter((vault) => getChain(vault.chain_id));
	const makePoint = (vault: VaultInfo): VaultChartPoint => ({
		x: vault.peak_nav!,
		y: vault.current_nav!,
		url: resolveVaultDetails(vault),
		hover: [
			`<b>${vault.name}</b>`,
			getVaultProtocolDisplayName(vault),
			`Chain: ${getChainDisplayName(vault.chain_id)}`,
			`Current TVL: ${formatTvl(vault.current_nav!)}`,
			`Peak TVL: ${formatTvl(vault.peak_nav!)}`,
			`Retention: ${((vault.current_nav! / vault.peak_nav!) * 100).toFixed(1)}%`,
			`3M return (ann.): ${returnLabel(vault.three_months_cagr)}`
		].join('<br>')
	});
	const chartVaults = colourBy === 'chain' ? included : included.filter(hasSupportedProtocol);
	const nameFor =
		colourBy === 'chain'
			? (vault: VaultInfo) => getChain(vault.chain_id)!.name
			: (vault: VaultInfo) => getProtocolDisplayName(vault.protocol, vault.protocol_slug);
	const traces = groupedTraces(chartVaults, nameFor, makePoint, colourBy === 'chain');
	return { traces, pointCount: chartVaults.length, excludedCount: base.length - included.length };
}

function cagr(vault: VaultInfo, window: string): number | null {
	if (window === '1m') return vault.one_month_cagr_net ?? vault.one_month_cagr;
	if (window === '3m') return vault.three_months_cagr_net ?? vault.three_months_cagr;
	if (window === '6m' || window === '1y') {
		const period = vault.period_results?.find((item) => item.period.toLowerCase() === window);
		return period?.cagr_net ?? period?.cagr_gross ?? null;
	}
	return vault.cagr_net ?? vault.cagr;
}

/** Build cumulative earnings chart points and protocol filters on the server. */
export function buildCumulativeChartData(
	vaults: VaultInfo[],
	minTvl: number,
	window: string,
	selectedProtocols: string[]
): CumulativeChartData {
	const eligible = vaults.filter(
		(vault) =>
			!isBlacklisted(vault) &&
			vault.current_nav != null &&
			vault.current_nav >= minTvl &&
			(cagr(vault, window) ?? Infinity) <= 10 &&
			cagr(vault, window) != null
	);
	const protocolOptions = [
		...new Map(eligible.map((vault) => [getProtocolDisplayName(vault.protocol, vault.protocol_slug), 0])).keys()
	]
		.map((name) => {
			const items = eligible.filter((vault) => getProtocolDisplayName(vault.protocol, vault.protocol_slug) === name);
			return {
				name,
				count: items.length,
				tvl: items.reduce((sum, vault) => sum + (vault.current_nav ?? 0), 0),
				logoUrl: getVaultProtocolLogoUrl(items[0]?.protocol_slug ?? '')
			};
		})
		.toSorted((a, b) => b.tvl - a.tvl || b.count - a.count || a.name.localeCompare(b.name));
	const selected = (
		selectedProtocols.length
			? eligible.filter((vault) =>
					selectedProtocols.includes(getProtocolDisplayName(vault.protocol, vault.protocol_slug))
				)
			: eligible
	).toSorted((a, b) => {
		const returnDifference = cagr(b, window)! - cagr(a, window)!;
		return returnDifference || (b.current_nav ?? 0) - (a.current_nav ?? 0) || a.name.localeCompare(b.name);
	});
	const points: CumulativeChartPoint[] = buildCumulativeTvlPoints(
		selected.map((vault) => ({
			name: vault.name,
			chain: getChainDisplayName(vault.chain_id),
			chainLogoUrl: getLogoUrl('blockchain', getChain(vault.chain_id)?.slug),
			protocol: getVaultProtocolDisplayName(vault),
			protocolLogoUrl: getVaultProtocolLogoUrl(vault.protocol_slug),
			realApy: cagr(vault, window)! * 100,
			individualTvl: vault.current_nav!,
			url: resolveVaultDetails(vault)
		}))
	);
	return { points, protocolOptions, matchingCount: eligible.length, selectedCount: selected.length };
}

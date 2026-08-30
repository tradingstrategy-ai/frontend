/**
 * Small, chart-specific payloads returned by `/vaults` chart routes.
 *
 * These deliberately contain presentation points rather than vault metadata,
 * so a chart never needs the complete vault JSON export in the browser.
 */
export interface VaultChartPoint {
	x: number;
	y: number;
	hover: string;
	url: string;
}

export interface VaultChartTrace {
	name: string;
	colour: string;
	points: VaultChartPoint[];
}

export interface VaultScatterChartData {
	traces: VaultChartTrace[];
	pointCount: number;
	excludedCount?: number;
}

export interface CumulativeChartPoint {
	value: [number, number];
	name: string;
	chain: string;
	chainLogoUrl?: string;
	protocol: string;
	protocolLogoUrl?: string;
	realApy: number;
	individualTvl: number;
	cumulativeTvl: number;
	tvlBetter: number;
	tvlLess: number;
	totalTvl: number;
	url: string;
}

export interface CumulativeProtocolOption {
	name: string;
	count: number;
	tvl: number;
	logoUrl?: string;
}

export interface CumulativeChartData {
	points: CumulativeChartPoint[];
	protocolOptions: CumulativeProtocolOption[];
	matchingCount: number;
	selectedCount: number;
}

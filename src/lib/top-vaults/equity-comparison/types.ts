/** Fixed comparison benchmarks available on the multi-vault equity chart. */
export const comparisonBenchmarkKeys = ['treasury', 'eth', 'btc'] as const;

export type ComparisonBenchmark = (typeof comparisonBenchmarkKeys)[number];

/** Whether vault curves show existing share-price returns or fee-adjusted returns. */
export const comparisonReturnModes = ['net', 'gross'] as const;

export type ComparisonReturnMode = (typeof comparisonReturnModes)[number];

/** Investor fee data required to calculate a net comparison curve. */
export interface ComparisonFeeProfile {
	entryRate: number;
	exitRate: number;
	managementRate: number;
	performanceRate: number;
}

/** Compact public vault metadata used by the comparison page. */
export interface ComparisonVault {
	id: string;
	name: string;
	href: string;
	logoUrl: string | null;
	protocolName: string;
	chainName: string;
	entityType: 'vault' | 'tokenised-fund' | 'blacklisted-vault';
	/** Null when the source does not provide every fee needed for a net curve. */
	feeProfile: ComparisonFeeProfile | null;
}

/** Raw share-price history returned by the comparison chart-data endpoint. */
export interface VaultPriceSeries {
	id: string;
	points: [timestamp: number, sharePrice: number][];
}

export interface AlignedEquityPoint {
	time: number;
	value: number;
}

export interface AlignedVaultSeries {
	id: string;
	anchor: number;
	discontinuous: boolean;
	points: AlignedEquityPoint[];
}

/** Server-prepared sampling resolutions used by the comparison chart controls. */
export type ComparisonTimeBucket = '4h' | '1d';

export const comparisonTimeSpanKeys = ['1M', '3M', '6M', '1Y', 'Max'] as const;

export type ComparisonTimeSpan = (typeof comparisonTimeSpanKeys)[number];

export interface ComparisonPeriodMetrics {
	cagr: number | null;
	since: string | null;
}

export interface ComparisonChartPoint {
	time: number;
	value: number;
	feeEvent?: 'after-entry' | 'before-exit' | 'after-exit';
}

export interface ComparisonChartSeries {
	id: string;
	discontinuous: boolean;
	points: Record<ComparisonTimeBucket, ComparisonChartPoint[]>;
	periodMetrics: Record<ComparisonTimeSpan, ComparisonPeriodMetrics>;
}

/** Compact, chart-ready response containing only the requested vaults and benchmarks. */
export interface VaultComparisonChartResponse {
	range: [start: number, end: number] | null;
	vaultSeries: ComparisonChartSeries[];
	benchmarkSeries: ComparisonChartSeries[];
	missingVaultIds: string[];
	benchmarkErrors: Partial<Record<ComparisonBenchmark, string>>;
}

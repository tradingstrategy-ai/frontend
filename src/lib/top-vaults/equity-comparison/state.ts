import { comparisonBenchmarkKeys, type ComparisonBenchmark } from './types';

export const MAX_SELECTED_VAULTS = 8;
export const EMPTY_COMPARISON_PARAMETER = 'comparison';
export const EMPTY_COMPARISON_VALUE = 'empty';

export interface EquityComparisonState {
	vaultIds: string[];
	benchmarks: ComparisonBenchmark[];
}

function uniqueTrimmed(values: readonly string[], limit = Number.POSITIVE_INFINITY): string[] {
	const seen = new Set<string>();
	const result: string[] = [];

	for (const value of values) {
		const trimmed = value.trim();
		if (!trimmed || seen.has(trimmed)) continue;
		seen.add(trimmed);
		result.push(trimmed);
		if (result.length === limit) break;
	}

	return result;
}

/** Canonicalise ordered vault IDs while preserving the first occurrence. */
export function canonicaliseComparisonVaultIds(values: readonly string[]): string[] {
	return uniqueTrimmed(values, MAX_SELECTED_VAULTS);
}

/** Canonicalise benchmarks into the fixed control/legend order. */
export function canonicaliseComparisonBenchmarks(values: readonly string[]): ComparisonBenchmark[] {
	const selected = new Set(uniqueTrimmed(values));
	return comparisonBenchmarkKeys.filter((benchmark) => selected.has(benchmark));
}

/** Parse comparison state from repeated `vault` and `benchmark` parameters. */
export function parseEquityComparisonState(searchParams: URLSearchParams): EquityComparisonState {
	return {
		vaultIds: canonicaliseComparisonVaultIds(searchParams.getAll('vault')),
		benchmarks: canonicaliseComparisonBenchmarks(searchParams.getAll('benchmark'))
	};
}

/** Replace comparison parameters while preserving unrelated query parameters. */
export function writeEquityComparisonState(
	searchParams: URLSearchParams,
	state: EquityComparisonState
): URLSearchParams {
	const next = new URLSearchParams(searchParams);
	next.delete('vault');
	next.delete('benchmark');
	next.delete(EMPTY_COMPARISON_PARAMETER);

	const vaultIds = canonicaliseComparisonVaultIds(state.vaultIds);
	for (const vaultId of vaultIds) next.append('vault', vaultId);
	for (const benchmark of canonicaliseComparisonBenchmarks(state.benchmarks)) next.append('benchmark', benchmark);
	if (!vaultIds.length) next.set(EMPTY_COMPARISON_PARAMETER, EMPTY_COMPARISON_VALUE);

	return next;
}

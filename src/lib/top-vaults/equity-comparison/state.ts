import {
	comparisonBenchmarkKeys,
	comparisonReturnModes,
	comparisonTimeSpanKeys,
	type ComparisonBenchmark,
	type ComparisonReturnMode,
	type ComparisonTimeSpan
} from './types';
import { deserialiseSearchParams, serialiseSearchParams, type ParamSchema } from '$lib/helpers/url-search-state';

export const MAX_SELECTED_VAULTS = 8;
export const EMPTY_COMPARISON_PARAMETER = 'comparison';
export const EMPTY_COMPARISON_VALUE = 'empty';

export interface EquityComparisonState {
	vaultIds: string[];
	benchmarks: ComparisonBenchmark[];
	timeSpan: ComparisonTimeSpan;
	returnMode: ComparisonReturnMode;
}

const comparisonSearchParamsSchema = {
	vault: { type: 'string[]', defaultValue: [] },
	benchmark: { type: 'string[]', defaultValue: [], options: comparisonBenchmarkKeys },
	period: { type: 'string', defaultValue: '3M', options: comparisonTimeSpanKeys },
	return: { type: 'string', defaultValue: 'net', options: comparisonReturnModes }
} as const satisfies ParamSchema;

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

/** Parse comparison state from the comparison URL parameters. */
export function parseEquityComparisonState(searchParams: URLSearchParams): EquityComparisonState {
	const state = deserialiseSearchParams(searchParams, comparisonSearchParamsSchema);
	return {
		vaultIds: canonicaliseComparisonVaultIds(state.vault),
		benchmarks: canonicaliseComparisonBenchmarks(state.benchmark),
		timeSpan: state.period as ComparisonTimeSpan,
		returnMode: state.return as ComparisonReturnMode
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
	next.delete('period');
	next.delete('return');
	next.delete(EMPTY_COMPARISON_PARAMETER);

	const vaultIds = canonicaliseComparisonVaultIds(state.vaultIds);
	const comparisonParams = new URLSearchParams(
		serialiseSearchParams(
			{
				vault: vaultIds,
				benchmark: canonicaliseComparisonBenchmarks(state.benchmarks),
				period: state.timeSpan,
				return: state.returnMode
			},
			comparisonSearchParamsSchema
		)
	);
	for (const [key, value] of comparisonParams) next.append(key, value);
	// Keep the default explicit too, so every copied comparison URL fully describes the chart.
	next.set('period', state.timeSpan);
	next.set('return', state.returnMode);
	if (!vaultIds.length) next.set(EMPTY_COMPARISON_PARAMETER, EMPTY_COMPARISON_VALUE);

	return next;
}

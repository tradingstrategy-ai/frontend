import {
	MAX_SELECTED_VAULTS,
	EMPTY_COMPARISON_PARAMETER,
	EMPTY_COMPARISON_VALUE,
	canonicaliseComparisonBenchmarks,
	canonicaliseComparisonVaultIds,
	parseEquityComparisonState,
	writeEquityComparisonState
} from './state';

describe('equity comparison state', () => {
	test('canonicalises vault IDs while preserving insertion order', () => {
		expect(canonicaliseComparisonVaultIds([' second ', 'first', 'second', '', 'third'])).toEqual([
			'second',
			'first',
			'third'
		]);
	});

	test('enforces the selection limit', () => {
		const values = Array.from({ length: MAX_SELECTED_VAULTS + 2 }, (_, index) => `vault-${index}`);
		expect(canonicaliseComparisonVaultIds(values)).toHaveLength(MAX_SELECTED_VAULTS);
	});

	test('uses fixed benchmark order and ignores unknown values', () => {
		expect(canonicaliseComparisonBenchmarks(['btc', 'unknown', 'treasury', 'btc'])).toEqual(['treasury', 'btc']);
	});

	test('round trips repeated parameters and preserves unrelated state', () => {
		const initial = new URLSearchParams('foo=bar&vault=a%2Cb&vault=two&benchmark=btc');
		const parsed = parseEquityComparisonState(initial);
		expect(parsed).toEqual({ vaultIds: ['a,b', 'two'], benchmarks: ['btc'] });

		const written = writeEquityComparisonState(initial, parsed);
		expect(written.get('foo')).toBe('bar');
		expect(written.getAll('vault')).toEqual(['a,b', 'two']);
		expect(written.getAll('benchmark')).toEqual(['btc']);
	});

	test('marks an intentionally empty selection so defaults are not restored', () => {
		const written = writeEquityComparisonState(new URLSearchParams(), { vaultIds: [], benchmarks: [] });
		expect(written.get(EMPTY_COMPARISON_PARAMETER)).toBe(EMPTY_COMPARISON_VALUE);
	});
});

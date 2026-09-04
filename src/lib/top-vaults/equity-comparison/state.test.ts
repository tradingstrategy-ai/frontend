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
		expect(parsed).toEqual({ vaultIds: ['a,b', 'two'], benchmarks: ['btc'], timeSpan: '3M', returnMode: 'net' });

		const written = writeEquityComparisonState(initial, parsed);
		expect(written.get('foo')).toBe('bar');
		expect(written.getAll('vault')).toEqual(['a,b', 'two']);
		expect(written.getAll('benchmark')).toEqual(['btc']);
		expect(written.get('period')).toBe('3M');
		expect(written.get('return')).toBe('net');
	});

	test('validates and persists the selected time period', () => {
		expect(parseEquityComparisonState(new URLSearchParams('period=1Y')).timeSpan).toBe('1Y');
		expect(parseEquityComparisonState(new URLSearchParams('period=invalid')).timeSpan).toBe('3M');

		const written = writeEquityComparisonState(new URLSearchParams(), {
			vaultIds: ['vault-one'],
			benchmarks: [],
			timeSpan: 'Max',
			returnMode: 'gross'
		});
		expect(written.get('period')).toBe('Max');
		expect(written.get('return')).toBe('gross');
	});

	test('marks an intentionally empty selection so defaults are not restored', () => {
		const written = writeEquityComparisonState(new URLSearchParams(), {
			vaultIds: [],
			benchmarks: [],
			timeSpan: '3M',
			returnMode: 'net'
		});
		expect(written.get(EMPTY_COMPARISON_PARAMETER)).toBe(EMPTY_COMPARISON_VALUE);
	});

	test('defaults invalid return modes to Net and persists explicit return state', () => {
		expect(parseEquityComparisonState(new URLSearchParams('return=unknown')).returnMode).toBe('net');
		expect(parseEquityComparisonState(new URLSearchParams('return=gross')).returnMode).toBe('gross');
		const written = writeEquityComparisonState(new URLSearchParams(), {
			vaultIds: ['vault-one'],
			benchmarks: [],
			timeSpan: '3M',
			returnMode: 'gross'
		});
		expect(written.get('return')).toBe('gross');
	});
});

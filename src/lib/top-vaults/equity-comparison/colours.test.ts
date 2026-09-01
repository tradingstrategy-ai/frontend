import { assignVaultComparisonColours, benchmarkComparisonColours, vaultComparisonColours } from './colours';

describe('comparison colours', () => {
	test('assigns unique vault colours and preserves surviving assignments', () => {
		const initial = assignVaultComparisonColours(['a', 'b', 'c']);
		const next = assignVaultComparisonColours(['a', 'c', 'd'], initial);
		expect(new Set(next.values()).size).toBe(3);
		expect(next.get('a')).toBe(initial.get('a'));
		expect(next.get('c')).toBe(initial.get('c'));
	});

	test('does not reuse fixed benchmark colours', () => {
		const benchmarkRgbColours = new Set(Object.values(benchmarkComparisonColours).map((colour) => colour.slice(0, 7)));
		for (const colour of vaultComparisonColours) {
			expect(benchmarkRgbColours).not.toContain(colour);
		}
	});
});

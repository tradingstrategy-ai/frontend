import type { ComparisonBenchmark } from './types';

/** Vault colours avoid the established blue, orange, and purple benchmark hues. */
export const vaultComparisonColours = [
	'#2fbf71',
	'#ef476f',
	'#ffd166',
	'#06d6a0',
	'#e76f51',
	'#8ac926',
	'#ff70a6',
	'#a7c957'
] as const;

export const benchmarkComparisonColours: Record<ComparisonBenchmark, string> = {
	treasury: '#4a90d9a0',
	eth: '#627eea80',
	btc: '#f7931a80'
};

/**
 * Preserve existing colour assignments and allocate the first unused colour to
 * newly selected vaults.
 */
export function assignVaultComparisonColours(
	vaultIds: readonly string[],
	previous: ReadonlyMap<string, string> = new Map()
): Map<string, string> {
	const assignments = new Map<string, string>();
	const used = new Set<string>();

	for (const vaultId of vaultIds) {
		const colour = previous.get(vaultId);
		if (
			colour &&
			vaultComparisonColours.includes(colour as (typeof vaultComparisonColours)[number]) &&
			!used.has(colour)
		) {
			assignments.set(vaultId, colour);
			used.add(colour);
		}
	}

	for (const vaultId of vaultIds) {
		if (assignments.has(vaultId)) continue;
		const colour = vaultComparisonColours.find((candidate) => !used.has(candidate));
		if (!colour) break;
		assignments.set(vaultId, colour);
		used.add(colour);
	}

	return assignments;
}

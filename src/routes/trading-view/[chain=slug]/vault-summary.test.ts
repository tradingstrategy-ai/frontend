import { describe, expect, it } from 'vitest';
import { summariseChainVaults } from './vault-summary';

describe('summariseChainVaults', () => {
	it('summarises every chain ID represented by a shared route slug', () => {
		const vaults = [
			{ chain_id: 999, last_updated_block: 100, last_updated_at: '2026-01-01T12:00:00+02:00' },
			{ chain_id: 9999, last_updated_block: 200, last_updated_at: '2026-01-01T11:00:00Z' },
			{ chain_id: 1, last_updated_block: 300, last_updated_at: '2026-01-01T12:00:00Z' }
		];

		expect(summariseChainVaults(vaults, new Set([999, 9999]))).toEqual({
			count: 2,
			lastUpdatedBlock: 200,
			lastUpdatedAt: '2026-01-01T11:00:00Z'
		});
	});

	it('returns an empty summary when no vault matches', () => {
		expect(summariseChainVaults([], new Set([1]))).toEqual({
			count: 0,
			lastUpdatedBlock: undefined,
			lastUpdatedAt: undefined
		});
	});
});

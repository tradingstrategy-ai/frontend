import { describe, expect, test } from 'vitest';
import { getChainDisplayName, getChain } from './chain';

describe('getChainDisplayName', () => {
	test('distinguishes HyperEVM from the Hyperliquid grouping', () => {
		expect(getChainDisplayName(999)).toBe('HyperEVM');
		expect(getChainDisplayName(9999)).toBe('Hyperliquid');
		expect(getChain('hyperliquid')?.name).toBe('Hyperliquid');
	});
});

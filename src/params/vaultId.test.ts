import { describe, test, expect } from 'vitest';
import { match } from './vaultId';

describe('vaultId param matcher', () => {
	test('matches EVM hex address', () => {
		expect(match('1-0xabc123def456')).toBe(true);
	});

	test('matches GRVT vlt: format', () => {
		expect(match('325-vlt:38t5xhy')).toBe(true);
	});

	test('matches Lighter pool format', () => {
		expect(match('9998-lighter-pool-281474976625478')).toBe(true);
	});

	test('matches Hibachi vault format', () => {
		expect(match('9997-hibachi-vault-2')).toBe(true);
	});

	test('rejects bare address without chain ID', () => {
		expect(match('0xabc123')).toBe(false);
	});

	test('rejects unknown format', () => {
		expect(match('9997-unknown-format')).toBe(false);
	});
});

import { describe, expect, test } from 'vitest';
import { solanaAddress } from '$lib/eth-defi/schemas/core';
import { decodeSolanaVaultAddress, isSolanaAddress, isSolanaVaultAddress, makeSolanaVaultAddress } from './solana';

const ACCOUNT = 'J7qhMAKnB6G5dvoAN9281ufabajKbyGQxxd2bq6R7fPJ';

describe('Solana account identities', () => {
	test.each([
		['11111111111111111111111111111111', '00'.repeat(32)],
		['JEKNVnkbo3jma5nREBBJCDoXFVeKkD56V3xKrvRmWxFG', 'ff'.repeat(32)],
		['1thX6LZfHDZZKUs92febYZhYRcXddmzfzF2NvTkPNE', '000102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f']
	])('round trips all 32 bytes including leading zeros and off-curve accounts: %s', (account, hex) => {
		expect(isSolanaAddress(account)).toBe(true);
		expect(solanaAddress.parse(account)).toBe(account);
		expect(makeSolanaVaultAddress(account)).toBe(`solana-vault-${hex}`);
		expect(decodeSolanaVaultAddress(`SOLANA-VAULT-${hex.toUpperCase()}`)).toBe(account);
	});

	test('preserves case-sensitive account identities', () => {
		const variant = ACCOUNT.slice(0, -1) + 'j';
		expect(isSolanaAddress(variant)).toBe(true);
		expect(makeSolanaVaultAddress(ACCOUNT)).not.toBe(makeSolanaVaultAddress(variant));
		for (const account of [ACCOUNT, variant]) {
			expect(decodeSolanaVaultAddress(makeSolanaVaultAddress(account))).toBe(account);
		}
	});

	test.each([
		'',
		'1'.repeat(31),
		'1'.repeat(33),
		'11111111111111111111111111111112\n',
		'z'.repeat(44),
		'0'.repeat(32),
		'é'.repeat(32),
		` ${ACCOUNT}`,
		`${ACCOUNT} `,
		`${ACCOUNT}\n`,
		'A'.repeat(10000)
	])('rejects malformed account %s', (address) => {
		expect(isSolanaAddress(address)).toBe(false);
		expect(solanaAddress.safeParse(address).success).toBe(false);
		expect(() => makeSolanaVaultAddress(address)).toThrow();
	});

	test.each([
		'solana-vault-',
		`solana-vault-${'a'.repeat(64)}\n`,
		`solana-vault-${'a'.repeat(63)}`,
		`solana-vault-${'g'.repeat(64)}`,
		`solana-vault-${'a'.repeat(65)}`
	])('rejects incomplete storage keys %s', (address) => {
		expect(isSolanaVaultAddress(address)).toBe(false);
		expect(() => decodeSolanaVaultAddress(address)).toThrow();
	});
});

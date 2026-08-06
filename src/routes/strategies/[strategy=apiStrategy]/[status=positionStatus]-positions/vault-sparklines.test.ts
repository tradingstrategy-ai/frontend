import { describe, expect, test } from 'vitest';
import { getPositionVault, getPositionVaultSparklines, type VaultSparklinePosition } from './vault-sparklines';

const vaults = [
	{
		id: 'ethereum-aave-v3-usdc',
		name: 'Aave USDC',
		address: '0xabc0000000000000000000000000000000000000',
		chain_id: 1
	},
	{
		id: 'base-morpho-usdc',
		name: 'Morpho USDC',
		address: '0xdef0000000000000000000000000000000000000',
		chain_id: 8453
	}
];

function position(position: Partial<VaultSparklinePosition>): VaultSparklinePosition {
	return {
		position_id: 1,
		pair: {
			isVault: true,
			pool_address: '0xabc0000000000000000000000000000000000000',
			symbol: 'Aave USDC',
			base: { chain_id: 1 },
			other_data: null
		},
		...position
	};
}

describe('getPositionVaultSparklines', () => {
	test('resolves vault positions by chain and address', () => {
		const result = getPositionVaultSparklines([position({})], vaults);

		expect(result).toEqual({
			1: {
				id: 'ethereum-aave-v3-usdc',
				name: 'Aave USDC'
			}
		});
	});

	test('uses direct vault ids from position metadata', () => {
		const result = getPositionVaultSparklines(
			[
				position({
					position_id: 2,
					pair: {
						isVault: true,
						symbol: 'Direct vault',
						other_data: { vault_id: 'direct-vault-id' }
					}
				})
			],
			[]
		);

		expect(result).toEqual({
			2: {
				id: 'direct-vault-id',
				name: 'Direct vault'
			}
		});
	});

	test('ignores non-vault positions', () => {
		const result = getPositionVaultSparklines(
			[
				position({
					position_id: 3,
					pair: {
						isVault: false,
						pool_address: '0xabc0000000000000000000000000000000000000',
						base: { chain_id: 1 }
					}
				})
			],
			vaults
		);

		expect(result).toEqual({});
	});

	test('does not cross-match the same address on a different chain', () => {
		const result = getPositionVaultSparklines(
			[
				position({
					position_id: 4,
					pair: {
						isVault: true,
						pool_address: '0xdef0000000000000000000000000000000000000',
						base: { chain_id: 1 }
					}
				})
			],
			vaults
		);

		expect(result).toEqual({});
	});

	test('resolves a full vault record for one position', () => {
		const result = getPositionVault(position({ position_id: 5 }), vaults);

		expect(result).toEqual(vaults[0]);
	});
});

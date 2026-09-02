import { describe, expect, test, vi } from 'vitest';
import {
	fetchPositionVaults,
	getPositionVault,
	getPositionVaultSparklines,
	type VaultSparklinePosition
} from './vault-sparklines';

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

	test('requests only deduplicated vault identifiers used by positions', async () => {
		const fetchFn = vi.fn(async () => new Response(JSON.stringify({ vaults: [] }), { status: 200 }));
		const vaultPosition = position({
			pair: {
				isVault: true,
				pool_address: '0xABC0000000000000000000000000000000000000',
				base: { chain_id: 1 },
				other_data: { vault_id: 'ethereum-aave-v3-usdc' }
			}
		});

		await fetchPositionVaults(fetchFn as unknown as Fetch, [vaultPosition, vaultPosition]);

		expect(fetchFn).toHaveBeenCalledOnce();
		expect(fetchFn).toHaveBeenCalledWith('/strategies/position-vault-data', {
			method: 'POST',
			headers: { 'content-type': 'application/json' },
			body: JSON.stringify({
				vaultIds: ['ethereum-aave-v3-usdc'],
				vaultAddresses: [{ chainId: 1, address: '0xabc0000000000000000000000000000000000000' }]
			})
		});
	});

	test('batches more vault identifiers than one lookup request accepts', async () => {
		const fetchFn = vi.fn(
			async (_input: RequestInfo | URL, _init?: RequestInit) =>
				new Response(JSON.stringify({ vaults: [] }), { status: 200 })
		);
		const positions = Array.from({ length: 101 }, (_, index) =>
			position({
				position_id: index + 1,
				pair: {
					isVault: true,
					other_data: { vault_id: `vault-${index}` }
				}
			})
		);

		await fetchPositionVaults(fetchFn as unknown as Fetch, positions);

		expect(fetchFn).toHaveBeenCalledTimes(2);
		const firstRequest = JSON.parse(fetchFn.mock.calls[0][1].body as string);
		const secondRequest = JSON.parse(fetchFn.mock.calls[1][1].body as string);
		expect(firstRequest.vaultIds).toHaveLength(100);
		expect(secondRequest.vaultIds).toEqual(['vault-100']);
	});
});

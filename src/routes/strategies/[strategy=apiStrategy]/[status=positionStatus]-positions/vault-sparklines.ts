import { vaultInfoSchema, type VaultInfo } from '$lib/top-vaults/schemas';

export interface PositionVaultSparkline {
	id: string;
	name: string;
}

type VaultPositionPair = {
	isVault: boolean;
	pool_address?: string | null;
	symbol?: string;
	base?: { address?: string | null; chain_id?: number };
	other_data?: Record<string, unknown> | null;
};

export type VaultSparklinePosition = {
	position_id: number;
	pair: VaultPositionPair;
};

type SparklineVaultInfo = Pick<VaultInfo, 'id' | 'name' | 'address' | 'chain_id'>;

const vaultIdKeys = ['vault_id', 'vaultId', 'top_vault_id', 'topVaultId'] as const;
const lookupBatchSize = 100;

function normaliseAddress(address: string | null | undefined) {
	return address?.trim().toLowerCase();
}

function getDirectVaultId(position: VaultSparklinePosition) {
	const otherData = position.pair.other_data;
	if (!otherData) return;

	for (const key of vaultIdKeys) {
		const value = otherData[key];
		if (typeof value === 'string' && value.trim()) {
			return value.trim();
		}
	}
}

function getPositionLabel(position: VaultSparklinePosition) {
	return position.pair.symbol ?? 'Vault';
}

/**
 * Fetch only the vault records referenced by the supplied strategy positions.
 *
 * @param fetchFn - SvelteKit fetch implementation
 * @param positions - Strategy positions whose vault metadata is needed
 */
export async function fetchPositionVaults(fetchFn: Fetch, positions: VaultSparklinePosition[]): Promise<VaultInfo[]> {
	const vaultIds = new Set<string>();
	const vaultAddresses = new Map<string, { chainId: number; address: string }>();

	for (const position of positions) {
		if (!position.pair.isVault) continue;
		const vaultId = getDirectVaultId(position);
		if (vaultId) vaultIds.add(vaultId);

		const address = normaliseAddress(position.pair.pool_address);
		const chainId = position.pair.base?.chain_id;
		if (address && chainId != null) {
			vaultAddresses.set(getVaultAddressKey(chainId, address), { chainId, address });
		}
	}

	if (vaultIds.size === 0 && vaultAddresses.size === 0) return [];
	const ids = [...vaultIds];
	const addresses = [...vaultAddresses.values()];
	const batchCount = Math.ceil(Math.max(ids.length, addresses.length) / lookupBatchSize);
	const batches = await Promise.all(
		Array.from({ length: batchCount }, async (_, index) => {
			const offset = index * lookupBatchSize;
			const response = await fetchFn('/strategies/position-vault-data', {
				method: 'POST',
				headers: { 'content-type': 'application/json' },
				body: JSON.stringify({
					vaultIds: ids.slice(offset, offset + lookupBatchSize),
					vaultAddresses: addresses.slice(offset, offset + lookupBatchSize)
				})
			});
			if (!response.ok) throw new Error(`Failed to fetch position vaults: ${response.status}`);
			return vaultInfoSchema.array().parse((await response.json()).vaults);
		})
	);

	return [...new Map(batches.flat().map((vault) => [vault.id, vault])).values()];
}

function getVaultAddressKey(chainId: number, address: string) {
	return `${chainId}:${address}`;
}

function buildVaultAddressIndex(vaults: SparklineVaultInfo[]) {
	return new Map(
		vaults
			.map((vault) => {
				const address = normaliseAddress(vault.address);
				return address ? [getVaultAddressKey(vault.chain_id, address), vault] : undefined;
			})
			.filter((entry): entry is [string, SparklineVaultInfo] => entry !== undefined)
	);
}

function buildVaultIdIndex<TVault extends SparklineVaultInfo>(vaults: TVault[]) {
	return new Map(vaults.map((vault) => [vault.id, vault]));
}

export function getPositionVault<TVault extends SparklineVaultInfo>(
	position: VaultSparklinePosition,
	vaults: TVault[]
): TVault | undefined {
	if (!position.pair.isVault) return;

	const directVaultId = getDirectVaultId(position);
	if (directVaultId) {
		const vault = buildVaultIdIndex(vaults).get(directVaultId);
		if (vault) return vault;
	}

	const poolAddress = normaliseAddress(position.pair.pool_address);
	if (!poolAddress) return;

	const positionChainId = position.pair.base?.chain_id;
	if (positionChainId == null) return;

	const vaultsByAddress = buildVaultAddressIndex(vaults);
	return vaultsByAddress.get(getVaultAddressKey(positionChainId, poolAddress)) as TVault | undefined;
}

/**
 * Resolve the vault sparkline identifier for each vault-backed position.
 *
 * Positions may include the top-vaults id directly in `pair.other_data`; when
 * they do not, we join against the top-vaults feed by chain and vault address.
 */
export function getPositionVaultSparklines(
	positions: VaultSparklinePosition[],
	vaults: SparklineVaultInfo[]
): Record<number, PositionVaultSparkline> {
	const vaultsById = buildVaultIdIndex(vaults);
	const vaultsByAddress = buildVaultAddressIndex(vaults);
	const resolved: Record<number, PositionVaultSparkline> = {};

	for (const position of positions) {
		if (!position.pair.isVault) continue;

		const directVaultId = getDirectVaultId(position);
		const poolAddress = normaliseAddress(position.pair.pool_address);
		const positionChainId = position.pair.base?.chain_id;
		const vault =
			(directVaultId ? vaultsById.get(directVaultId) : undefined) ??
			(poolAddress && positionChainId != null
				? vaultsByAddress.get(getVaultAddressKey(positionChainId, poolAddress))
				: undefined);

		if (vault) {
			resolved[position.position_id] = {
				id: vault.id,
				name: vault.name
			};
			continue;
		}

		if (directVaultId) {
			resolved[position.position_id] = {
				id: directVaultId,
				name: getPositionLabel(position)
			};
		}
	}

	return resolved;
}

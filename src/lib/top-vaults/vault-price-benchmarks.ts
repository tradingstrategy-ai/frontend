import type { VaultInfo } from './schemas';
import { isPerpetualFuturesVault } from './isPerpetualFuturesVault';

export type VaultPriceBenchmarkToken = 'BTC' | 'ETH';

const BTC_AND_ETH = ['BTC', 'ETH'] as const;
const GMX_STABLECOIN_SYMBOLS = new Set([
	'usdc',
	'usdc.e',
	'usdt',
	'usdt.e',
	'usdt0',
	'usde',
	'susde',
	'dai',
	'usdg',
	'usds',
	'usdf',
	'usd1',
	'gho',
	'frax',
	'pyusd',
	'fdusd',
	'usdb',
	'usdx',
	'usda',
	'crvusd',
	'usdd',
	'lusd',
	'dola',
	'usdp',
	'usd0',
	'usdn',
	'usdr',
	'usdy'
]);

type BenchmarkVault = Pick<VaultInfo, 'flags' | 'chain_id' | 'name' | 'protocol_slug' | 'vault_slug'>;

/**
 * Whether a GMX GM swap pool has two stablecoin assets.
 *
 * GMX uses its human-readable pool name because slugification makes token symbols
 * such as `USDC.e` ambiguous. A token name may itself contain hyphens, so every
 * possible separator is considered.
 *
 * @param vault - GMX vault metadata containing the market name
 */
function isGmxStableStablePool(vault: BenchmarkVault): boolean {
	if (vault.protocol_slug !== 'gmx' || !vault.vault_slug.startsWith('gm-swap-')) return false;

	const poolName = vault.name.match(/^GM swap \[(.+)]$/)?.[1];
	if (!poolName) return false;

	const isStablecoin = (token: string) => GMX_STABLECOIN_SYMBOLS.has(token.toLowerCase().replace('₮', 't'));

	return [...poolName].some(
		(token, index) => token === '-' && isStablecoin(poolName.slice(0, index)) && isStablecoin(poolName.slice(index + 1))
	);
}

/**
 * Return crypto price benchmarks that are relevant to a vault's underlying exposure.
 *
 * Perpetual futures, GMX GLV, and crypto-exposed GMX GM vaults are compared with BTC and ETH.
 * GLV pools deliberately use both benchmarks to match perpetual futures vault comparisons.
 * GM BTC and ETH pools use only their respective market asset, while stable-stable GM swap
 * pools keep the U.S. Treasury benchmark.
 *
 * @param vault - Vault metadata used to determine its market exposure
 */
export function getVaultPriceBenchmarkTokens(vault: BenchmarkVault): VaultPriceBenchmarkToken[] {
	if (isPerpetualFuturesVault(vault) || (vault.protocol_slug === 'gmx' && vault.vault_slug.startsWith('glv-'))) {
		return [...BTC_AND_ETH];
	}

	if (vault.protocol_slug !== 'gmx') return [];
	if (isGmxStableStablePool(vault)) return [];
	if (vault.vault_slug.startsWith('gm-btc-')) return ['BTC'];
	if (vault.vault_slug.startsWith('gm-eth-')) return ['ETH'];

	return [...BTC_AND_ETH];
}

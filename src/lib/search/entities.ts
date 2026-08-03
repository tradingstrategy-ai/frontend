/**
 * Shared public search result types.
 *
 * The server-side index keeps additional matching terms private; browser code
 * only receives this serialisable result shape.
 */
export type SearchEntityType =
	| 'vault'
	| 'tokenised-fund'
	| 'blacklisted-vault'
	| 'curator'
	| 'protocol'
	| 'stablecoin'
	| 'chain';

export const searchEntityColours: Record<SearchEntityType, string> = {
	vault: 'var(--c-search-entity-vault)',
	'tokenised-fund': 'var(--c-search-entity-tokenised-fund)',
	'blacklisted-vault': 'var(--c-search-entity-blacklisted-vault)',
	curator: 'var(--c-search-entity-curator)',
	protocol: 'var(--c-search-entity-protocol)',
	stablecoin: 'var(--c-search-entity-stablecoin)',
	chain: 'var(--c-search-entity-chain)'
};

export const searchEntityLabels: Record<SearchEntityType, string> = {
	vault: 'Vault',
	'tokenised-fund': 'Tokenised fund',
	'blacklisted-vault': 'Blacklisted vault',
	curator: 'Curator',
	protocol: 'Protocol',
	stablecoin: 'Stablecoin',
	chain: 'Chain'
};

export interface SearchResult {
	id: string;
	name: string;
	entityType: SearchEntityType;
	/** Internal vault identifier used to load a vault-only 90-day price sparkline. */
	vaultId: string | null;
	/** Full vault contract address; null for non-vault entities. */
	address: string | null;
	averageApy1m: number | null;
	latestTvl: number | null;
	href: string;
	logoUrl: string | null;
}

export interface SearchResponse {
	query: string;
	results: SearchResult[];
	total: number;
}

/**
 * Format a vault address as its `0x` prefix plus the first eight hexadecimal digits.
 *
 * @param address Full vault contract address
 */
export function formatVaultAddressPrefix(address: string | null): string | null {
	const value = address?.trim();
	if (!value) return null;
	if (/^0x/i.test(value)) return `0x${value.slice(2, 10)}`;
	return value.slice(0, 8);
}

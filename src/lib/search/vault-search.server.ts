import { getLogoUrl } from '$lib/helpers/assets';
import { getChain, getChainDisplayName } from '$lib/helpers/chain';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import {
	buildStablecoinMetadataLookup,
	getStablecoinLogoUrl,
	resolveStablecoinSlug
} from '$lib/stablecoin-metadata/helpers';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	calculateTotalTvl,
	calculateTvlWeightedApy,
	getCurrencyUsdRates,
	getMonthlyReturn,
	getProtocolDisplayName,
	getVaultProtocolDisplayName,
	getVaultCurrentTvlUsd,
	isBlacklisted,
	isUnknownVaultProtocol,
	meetsMinTvl,
	UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME,
	UNKNOWN_VAULT_PROTOCOL_SLUG,
	withVaultCurrentTvlUsd,
	withVaultDenominationTokenRate
} from '$lib/top-vaults/helpers';
import type { TopVaults, VaultInfo } from '$lib/top-vaults/schemas';
import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';
import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
import type { SearchEntityType, SearchResponse, SearchResult } from './entities';

const INDEX_TTL_MS = 2 * 60 * 1000;
const MAX_RESULTS = 100;

type IndexedSearchRecord = SearchResult & {
	searchTerms: string[];
};

type SearchIndex = {
	version: string;
	expires: number;
	records: IndexedSearchRecord[];
};

type SearchOptions = {
	/** Return the highest-ranked match for each entity type before filling remaining slots. */
	diversifyTypes?: boolean;
};

let cachedIndex: SearchIndex | undefined;

function normalise(value: string): string {
	return value
		.normalize('NFKD')
		.replace(/\p{Diacritic}/gu, '')
		.toLocaleLowerCase()
		.replace(/[^\p{L}\p{N}]+/gu, ' ')
		.trim()
		.replace(/\s+/g, ' ');
}

function uniqueTerms(terms: Array<string | null | undefined>): string[] {
	return [
		...new Set(
			terms
				.filter((term): term is string => Boolean(term?.trim()))
				.map(normalise)
				.filter(Boolean)
		)
	];
}

function getCuratorLogo(vault: VaultInfo, topVaults: TopVaults): string | null {
	if (!vault.curator_slug) return null;
	const logos = topVaults.curators[vault.curator_slug]?.logos;
	return logos?.generic ?? logos?.light ?? logos?.dark ?? null;
}

function getVaultLogo(vault: VaultInfo, topVaults: TopVaults): string | null {
	return getCuratorLogo(vault, topVaults) ?? getVaultProtocolLogoUrl(vault.protocol_slug) ?? null;
}

function getEligibleVaults(vaults: VaultInfo[]): VaultInfo[] {
	return vaults.filter((vault) => !isBlacklisted(vault) && meetsMinTvl(vault));
}

function getGroupMetrics(vaults: VaultInfo[]) {
	const eligibleVaults = getEligibleVaults(vaults);
	const weightedVaults = eligibleVaults.map(withVaultCurrentTvlUsd);

	return {
		averageApy1m: calculateTvlWeightedApy(weightedVaults),
		latestTvl: calculateTotalTvl(weightedVaults)
	};
}

function addRecord(
	records: IndexedSearchRecord[],
	result: SearchResult,
	searchTerms: Array<string | null | undefined>
) {
	records.push({ ...result, searchTerms: uniqueTerms([result.name, ...searchTerms]) });
}

function buildIndex(topVaults: TopVaults, stablecoins: StablecoinMetadata[]): IndexedSearchRecord[] {
	const metadataLookup = buildStablecoinMetadataLookup(stablecoins);
	const metadataBySlug = new Map(stablecoins.map((stablecoin) => [stablecoin.slug, stablecoin]));
	const currencyUsdRates = getCurrencyUsdRates(stablecoins);
	const vaults = topVaults.vaults.map((vault) => {
		const stablecoinSlug =
			resolveStablecoinSlug(
				{ slug: vault.denomination_slug, symbol: vault.denomination, name: vault.normalised_denomination },
				metadataLookup
			) ?? vault.denomination_slug;
		return withVaultDenominationTokenRate(vault, metadataBySlug.get(stablecoinSlug), currencyUsdRates);
	});
	const records: IndexedSearchRecord[] = [];

	for (const vault of vaults) {
		addRecord(
			records,
			{
				id: `vault:${vault.id}`,
				name: vault.name,
				entityType: isBlacklisted(vault)
					? 'blacklisted-vault'
					: vault.flags.includes('tokenised_fund')
						? 'tokenised-fund'
						: 'vault',
				vaultId: vault.id,
				address: vault.address,
				protocolName: getVaultProtocolDisplayName(vault),
				chainName: getChainDisplayName(vault.chain_id),
				averageApy1m: getMonthlyReturn(vault),
				latestTvl: getVaultCurrentTvlUsd(vault),
				href: `/vaults/${vault.vault_slug}`,
				logoUrl: getVaultLogo(vault, topVaults)
			},
			[
				vault.vault_slug,
				vault.address,
				vault.protocol,
				vault.protocol_slug,
				vault.curator_name,
				vault.curator_slug,
				vault.chain,
				vault.denomination,
				vault.normalised_denomination
			]
		);
	}

	const curatorVaults = new Map<string, VaultInfo[]>();
	const protocolVaults = new Map<string, VaultInfo[]>();
	const stablecoinVaults = new Map<string, VaultInfo[]>();
	const chainVaults = new Map<string, VaultInfo[]>();

	for (const vault of vaults) {
		if (vault.curator_slug)
			curatorVaults.set(vault.curator_slug, [...(curatorVaults.get(vault.curator_slug) ?? []), vault]);
		const protocolSlug = isUnknownVaultProtocol(vault) ? UNKNOWN_VAULT_PROTOCOL_SLUG : vault.protocol_slug;
		protocolVaults.set(protocolSlug, [...(protocolVaults.get(protocolSlug) ?? []), vault]);

		if (vault.stablecoinish) {
			const stablecoinSlug =
				resolveStablecoinSlug(
					{ slug: vault.denomination_slug, symbol: vault.denomination, name: vault.normalised_denomination },
					metadataLookup
				) ?? vault.denomination_slug;
			stablecoinVaults.set(stablecoinSlug, [...(stablecoinVaults.get(stablecoinSlug) ?? []), vault]);
		}

		const chain = getChain(vault.chain_id);
		if (chain) chainVaults.set(chain.slug, [...(chainVaults.get(chain.slug) ?? []), vault]);
	}

	for (const [slug, groupVaults] of curatorVaults) {
		const curator = topVaults.curators[slug];
		if (!curator) continue;
		const logos = curator.logos;
		addRecord(
			records,
			{
				id: `curator:${slug}`,
				name: curator.name,
				entityType: 'curator',
				vaultId: null,
				address: null,
				protocolName: null,
				chainName: null,
				...getGroupMetrics(groupVaults),
				href: `/vaults/curators/${slug}`,
				logoUrl: logos?.generic ?? logos?.light ?? logos?.dark ?? null
			},
			[slug, curator.name]
		);
	}

	for (const [slug, groupVaults] of protocolVaults) {
		const fallbackVault = groupVaults[0];
		const isUnknown = slug === UNKNOWN_VAULT_PROTOCOL_SLUG;
		addRecord(
			records,
			{
				id: `protocol:${slug}`,
				name: isUnknown ? UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME : getProtocolDisplayName(fallbackVault.protocol, slug),
				entityType: 'protocol',
				vaultId: null,
				address: null,
				protocolName: null,
				chainName: null,
				...getGroupMetrics(groupVaults),
				href: `/vaults/protocols/${slug}`,
				logoUrl: getVaultProtocolLogoUrl(slug) ?? null
			},
			[slug, fallbackVault.protocol, isUnknown ? UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME : null]
		);
	}

	for (const metadata of stablecoins) {
		if (!stablecoinVaults.has(metadata.slug)) stablecoinVaults.set(metadata.slug, []);
	}

	for (const [slug, groupVaults] of stablecoinVaults) {
		const metadata = metadataBySlug.get(slug);
		const fallbackVault = groupVaults[0];
		addRecord(
			records,
			{
				id: `stablecoin:${slug}`,
				name: metadata?.name ?? fallbackVault?.normalised_denomination ?? fallbackVault?.denomination ?? slug,
				entityType: 'stablecoin',
				vaultId: null,
				address: null,
				protocolName: null,
				chainName: null,
				...getGroupMetrics(groupVaults),
				href: `/vaults/stablecoins/${slug}`,
				logoUrl: getStablecoinLogoUrl(slug) ?? null
			},
			[slug, metadata?.symbol, metadata?.name, fallbackVault?.denomination, fallbackVault?.normalised_denomination]
		);
	}

	for (const [slug, groupVaults] of chainVaults) {
		const chain = getChain(slug);
		const fallbackVault = groupVaults[0];
		addRecord(
			records,
			{
				id: `chain:${slug}`,
				name: chain?.name ?? fallbackVault.chain,
				entityType: 'chain',
				vaultId: null,
				address: null,
				protocolName: null,
				chainName: null,
				...getGroupMetrics(groupVaults),
				href: `/vaults/chains/${slug}`,
				logoUrl: getLogoUrl('blockchain', slug) ?? null
			},
			[slug, fallbackVault.chain]
		);
	}

	return records;
}

async function getIndex(fetch: Fetch): Promise<SearchIndex> {
	const [topVaults, stablecoins] = await Promise.all([getCachedTopVaults(fetch), fetchStablecoinMetadataIndex(fetch)]);
	const generatedAt = new Date(topVaults.generated_at).toISOString();
	const now = Date.now();
	if (cachedIndex?.version.startsWith(generatedAt) && cachedIndex.expires > now) return cachedIndex;

	cachedIndex = {
		version: `${generatedAt}:${now}`,
		expires: now + INDEX_TTL_MS,
		records: buildIndex(topVaults, stablecoins)
	};
	return cachedIndex;
}

function getMatchScore(record: IndexedSearchRecord, query: string, tokens: string[]): number | null {
	const name = normalise(record.name);
	const terms = record.searchTerms;
	if (!tokens.every((token) => terms.some((term) => term.includes(token)))) return null;
	if (name === query || terms.some((term) => term === query)) return 5;
	if (name.startsWith(query)) return 4;
	if (tokens.every((token) => name.split(' ').some((nameToken) => nameToken.startsWith(token)))) return 3;
	if (terms.some((term) => term.startsWith(query))) return 2;
	return 1;
}

/**
 * Search the server-side vault index.
 *
 * @param fetch SvelteKit fetch used to load cached JSON datasets
 * @param query User-supplied search query
 * @param limit Maximum number of public results to return
 * @param options Widget-specific result selection options
 */
export async function searchVaultEntities(
	fetch: Fetch,
	query: string,
	limit = MAX_RESULTS,
	options: SearchOptions = {}
): Promise<SearchResponse> {
	const trimmedQuery = query.trim();
	if (!trimmedQuery) return { query: '', results: [], total: 0 };
	const index = await getIndex(fetch);

	const normalisedQuery = normalise(trimmedQuery);
	if (!normalisedQuery) return { query: trimmedQuery, results: [], total: 0 };
	const tokens = normalisedQuery.split(' ').filter(Boolean);
	const shortQuery = normalisedQuery.length === 1;
	const matches = index.records
		.map((record) => ({ record, score: getMatchScore(record, normalisedQuery, tokens) }))
		.filter((match): match is { record: IndexedSearchRecord; score: number } => match.score !== null)
		.filter((match) => !shortQuery || match.score >= 2)
		.toSorted((a, b) => {
			const aBlacklisted = a.record.entityType === 'blacklisted-vault';
			const bBlacklisted = b.record.entityType === 'blacklisted-vault';
			if (aBlacklisted !== bBlacklisted) return aBlacklisted ? 1 : -1;
			if (a.score !== b.score) return b.score - a.score;
			if ((a.record.latestTvl ?? -1) !== (b.record.latestTvl ?? -1)) {
				return (b.record.latestTvl ?? -1) - (a.record.latestTvl ?? -1);
			}
			return a.record.name.localeCompare(b.record.name);
		});

	const resultLimit = Math.min(Math.max(limit, 1), MAX_RESULTS);
	const selectedMatches = options.diversifyTypes
		? selectDiversifiedMatches(matches, resultLimit)
		: matches.slice(0, resultLimit);

	return {
		query: trimmedQuery,
		results: selectedMatches.map(({ record }) => {
			const { searchTerms, ...result } = record;
			void searchTerms;
			return result;
		}),
		total: matches.length
	};
}

/**
 * Select varied entity types before filling the remaining available suggestions.
 */
function selectDiversifiedMatches(matches: Array<{ record: IndexedSearchRecord; score: number }>, limit: number) {
	const selected: Array<{ record: IndexedSearchRecord; score: number }> = [];
	const coveredTypes = new Set<SearchEntityType>();

	for (const match of matches) {
		if (match.record.entityType === 'blacklisted-vault') continue;
		if (!coveredTypes.has(match.record.entityType)) {
			selected.push(match);
			coveredTypes.add(match.record.entityType);
		}
		if (selected.length === limit) return selected;
	}

	const selectedIds = new Set(selected.map(({ record }) => record.id));
	for (const match of matches) {
		if (!selectedIds.has(match.record.id)) selected.push(match);
		if (selected.length === limit) break;
	}

	return selected;
}

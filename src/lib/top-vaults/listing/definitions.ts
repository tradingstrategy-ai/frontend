/**
 * Browser-safe listing definitions and scope predicates.
 *
 * Route loaders and the continuation endpoint use these definitions to ensure
 * that a URL can only narrow its declared listing population.
 */
import { getChainsBySlug } from '$lib/helpers/chain';
import {
	DEFAULT_TVL_KEY,
	MAX_SUMMARY_TVL_USD,
	isBlacklisted,
	isPermissionedVault,
	isUnknownVaultProtocol
} from '../helpers';
import type { VaultInfo } from '../schemas';
import type { VaultListingOptions } from './query';
import type { VaultListingQueryDefaults } from './state';

export const vaultListingKeys = [
	'top',
	'all',
	'high-tvl',
	'new-vaults',
	'negative',
	'blacklisted',
	'whitelisted',
	'chain',
	'protocol',
	'stablecoin',
	'curator',
	'tokenised-funds',
	'international'
] as const;

export type VaultListingKey = (typeof vaultListingKeys)[number];

export interface VaultListingDefinition {
	key: VaultListingKey;
	defaults: VaultListingQueryDefaults;
	options: VaultListingOptions;
	requiresScope: boolean;
}

const commonOptions: VaultListingOptions = {
	includeBlacklisted: false,
	filterTvl: false,
	showFilters: true,
	tvlThreshold: 50_000,
	includeBlacklistedInStats: false
};

export const vaultListingDefinitions: Record<VaultListingKey, VaultListingDefinition> = {
	top: { key: 'top', defaults: { tvl: DEFAULT_TVL_KEY }, options: commonOptions, requiresScope: false },
	all: {
		key: 'all',
		defaults: { tvl: '10k', risk: 1 },
		options: { ...commonOptions, includeBlacklisted: true },
		requiresScope: false
	},
	'high-tvl': { key: 'high-tvl', defaults: { tvl: '2m' }, options: commonOptions, requiresScope: false },
	'new-vaults': { key: 'new-vaults', defaults: { tvl: '10k', age: 1 }, options: commonOptions, requiresScope: false },
	negative: {
		key: 'negative',
		defaults: { tvl: '10k', mr: 'neg', sort: '1m-ann', direction: 'asc' },
		options: commonOptions,
		requiresScope: false
	},
	blacklisted: {
		key: 'blacklisted',
		defaults: { tvl: 'any', risk: 0, unknown: false, sort: 'tvl', direction: 'desc' },
		options: {
			...commonOptions,
			includeBlacklisted: true,
			includeBlacklistedInStats: true,
			maxSummaryTvlUsd: MAX_SUMMARY_TVL_USD
		},
		requiresScope: false
	},
	whitelisted: {
		key: 'whitelisted',
		defaults: { tvl: 'any', risk: 1, unknown: false, sort: 'tvl', direction: 'desc' },
		options: {
			...commonOptions,
			includeBlacklisted: true,
			includeBlacklistedInStats: true
		},
		requiresScope: false
	},
	chain: { key: 'chain', defaults: { tvl: '10k' }, options: commonOptions, requiresScope: true },
	protocol: {
		key: 'protocol',
		defaults: { tvl: '10k', unknown: false, amm: false },
		options: commonOptions,
		requiresScope: true
	},
	stablecoin: {
		key: 'stablecoin',
		defaults: { tvl: '10k', unknown: false },
		options: commonOptions,
		requiresScope: true
	},
	curator: {
		key: 'curator',
		defaults: { tvl: '10k', sort: 'tvl', unknown: false },
		options: commonOptions,
		requiresScope: true
	},
	'tokenised-funds': {
		key: 'tokenised-funds',
		defaults: { tvl: '10k', unknown: false },
		options: commonOptions,
		requiresScope: false
	},
	international: {
		key: 'international',
		defaults: { tvl: '10k', unknown: false },
		options: commonOptions,
		requiresScope: false
	}
};

export function isVaultListingKey(value: string | null): value is VaultListingKey {
	return value != null && (vaultListingKeys as readonly string[]).includes(value);
}

export function getVaultListingDefinition(key: VaultListingKey): VaultListingDefinition {
	return vaultListingDefinitions[key];
}

/** Resolve dynamic defaults which are part of an immutable route definition. */
export function getVaultListingDefaults(key: VaultListingKey, scope?: string): VaultListingQueryDefaults {
	if (key === 'chain' && scope === 'robinhood') return { ...vaultListingDefinitions[key].defaults, tvl: 'any' };
	if (key === 'protocol' && scope === 'apex') return { ...vaultListingDefinitions[key].defaults, tvl: 'any' };
	return vaultListingDefinitions[key].defaults;
}

/** Apply a definition's fixed scope before interactive filters are considered. */
export function filterVaultListingScope(vaults: VaultInfo[], key: VaultListingKey, scope?: string): VaultInfo[] {
	switch (key) {
		case 'blacklisted':
			return vaults.filter(isBlacklisted);
		case 'whitelisted':
			return vaults.filter(isPermissionedVault);
		case 'chain': {
			if (!scope) return [];
			const chainIds = new Set(getChainsBySlug(scope).map((chain) => chain.id));
			return vaults.filter((vault) => chainIds.has(vault.chain_id));
		}
		case 'protocol':
			if (!scope) return [];
			return vaults.filter((vault) =>
				scope === 'unknown' ? isUnknownVaultProtocol(vault) : vault.protocol_slug === scope
			);
		case 'stablecoin':
			return scope ? vaults.filter((vault) => vault.denomination_slug === scope) : [];
		case 'curator':
			return scope ? vaults.filter((vault) => vault.curator_slug === scope) : [];
		case 'tokenised-funds':
			return vaults.filter((vault) => vault.flags.includes('tokenised_fund'));
		case 'international':
			// International listings need denomination-rate enrichment, performed by
			// the server resolver. Do not accidentally expose the unscoped dataset.
			return [];
		default:
			return vaults;
	}
}

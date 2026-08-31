/**
 * Framework-independent vault-listing query helpers.
 *
 * Both SvelteKit loaders and browser compatibility consumers use this module so
 * a page boundary can never sort a different prefix from the server.
 */
import { getChainDisplayName } from '$lib/helpers/chain';
import type { Core3Protocol, VaultInfo } from '../schemas';
import {
	calculateTotalTvl,
	calculateTvlWeightedApy,
	ageFilterOptions,
	ddFilterOptions,
	getLifetimeMaxDrawdown,
	getMonthlyReturn,
	getVaultCurrentTvlUsd,
	getVaultPeakTvlUsd,
	getCore3PolForVault,
	getVaultProtocolDisplayName,
	isAmmPoolLikeVault,
	isBlacklisted,
	isPermissionedVault,
	isUnknownVaultProtocol,
	matchesVolatilityFilter,
	monthlyReturnFilterOptions,
	rankVaultsBy,
	riskFilterOptions,
	tvlFilterOptions,
	volatilityFilterOptions,
	withVaultCurrentTvlUsd
} from '../helpers';
import { compareVaultsByReturn, type ReturnColumnId } from '../return-columns';

export type VaultSortDirection = 'asc' | 'desc';

export interface VaultListingQuery {
	tvl: string;
	age: number;
	risk: number;
	dd: string;
	vol: string;
	mr: string;
	q: string;
	closed: boolean;
	unknown: boolean;
	amm: boolean;
	private: boolean;
	sort: string;
	direction: VaultSortDirection;
}

export interface VaultListingOptions {
	includeBlacklisted: boolean;
	filterTvl: boolean;
	showFilters: boolean;
	tvlThreshold: number;
	includeBlacklistedInStats: boolean;
	maxSummaryTvlUsd?: number;
	treasuryRate?: number | null;
	/** Provider whose risk score is used by the provider_risk_rating sort. */
	ratingProvider?: 'core3' | 'xerberus';
}

export interface VaultListingResult {
	vaults: VaultInfo[];
	hiddenByTvl: number;
	hiddenBlacklistedCount: number;
	hiddenVaults: VaultInfo[];
	totalTvl: number;
	avgTvlWeightedApy1M: number | null;
}

/**
 * Return whether a vault falls inside one technical-risk filter range.
 *
 * @param vault - Vault whose numeric technical risk is checked.
 * @param riskFilter - Inclusive risk range selected by the listing.
 */
export function matchesVaultRisk(
	vault: Pick<VaultInfo, 'risk_numeric'>,
	riskFilter: Pick<(typeof riskFilterOptions)[number], 'minValue' | 'maxValue'>
): boolean {
	if (vault.risk_numeric != null) {
		return vault.risk_numeric >= riskFilter.minValue && vault.risk_numeric <= riskFilter.maxValue;
	}
	return riskFilter.minValue === 0 && riskFilter.maxValue >= 50;
}

function compareStrings(value: (vault: VaultInfo) => string) {
	return (a: VaultInfo, b: VaultInfo) => value(a).localeCompare(value(b));
}

function canonicalKey(vault: VaultInfo): string {
	return vault.id || `${vault.chain_id}:${vault.address.toLowerCase()}`;
}

/** Sort the full matching population using a stable canonical tie-breaker. */
export function sortVaults(
	vaults: VaultInfo[],
	sort: string,
	direction: VaultSortDirection,
	ratingProvider?: VaultListingOptions['ratingProvider'],
	core3Protocols: Record<string, Core3Protocol> = {}
): VaultInfo[] {
	const comparator = (() => {
		switch (sort) {
			case 'chain':
				return compareStrings((vault) => getChainDisplayName(vault.chain_id));
			case 'vault':
				return compareStrings((vault) => `${vault.name.trim()} ${getVaultProtocolDisplayName(vault)}`);
			case 'three_months_sharpe':
				return rankVaultsBy(['three_months_sharpe']);
			case 'three_months_volatility':
				return rankVaultsBy(['three_months_volatility']);
			case 'max_dd':
				return (a: VaultInfo, b: VaultInfo) =>
					(getLifetimeMaxDrawdown(a) ?? -Infinity) - (getLifetimeMaxDrawdown(b) ?? -Infinity);
			case 'denomination':
				return compareStrings((vault) => vault.denomination);
			case 'tvl':
				return (a: VaultInfo, b: VaultInfo) =>
					rankVaultsBy(['current_tvl_usd', 'peak_tvl_usd'])(
						{ current_tvl_usd: getVaultCurrentTvlUsd(a), peak_tvl_usd: getVaultPeakTvlUsd(a) },
						{ current_tvl_usd: getVaultCurrentTvlUsd(b), peak_tvl_usd: getVaultPeakTvlUsd(b) }
					);
			case 'age':
				return rankVaultsBy(['years']);
			case 'fees':
				return rankVaultsBy(['mgmt_fee', 'perf_fee'], Infinity);
			case 'lockup':
				return rankVaultsBy(['lockup'], Infinity);
			case 'risk':
				return rankVaultsBy(['risk_numeric'], Infinity);
			case 'provider_risk_rating':
				return (a: VaultInfo, b: VaultInfo) => {
					const score = (vault: VaultInfo) =>
						ratingProvider === 'xerberus'
							? (vault.xerberus?.score ?? -Infinity)
							: (getCore3PolForVault(vault, core3Protocols)?.score ?? Infinity);
					const aScore = score(a);
					const bScore = score(b);
					return aScore - bScore;
				};
			default:
				return compareVaultsByReturn(sort as ReturnColumnId);
		}
	})();
	return vaults.toSorted((a, b) => {
		const result = comparator(a, b);
		const ordered = direction === 'desc' ? -result : result;
		return ordered || canonicalKey(a).localeCompare(canonicalKey(b));
	});
}

/** Apply the complete listing filter pipeline before sorting and pagination. */
export function queryVaultListing(
	vaults: VaultInfo[],
	query: VaultListingQuery,
	options: VaultListingOptions
): VaultListingResult {
	const tvl = tvlFilterOptions.find((item) => item.key === query.tvl) ?? tvlFilterOptions[0];
	const age = ageFilterOptions[query.age] ?? ageFilterOptions[0];
	const risk = riskFilterOptions[query.risk] ?? riskFilterOptions[0];
	const dd = ddFilterOptions.find((item) => item.key === query.dd) ?? ddFilterOptions[0];
	const volatility = volatilityFilterOptions.find((item) => item.key === query.vol) ?? volatilityFilterOptions[0];
	const monthlyReturn =
		monthlyReturnFilterOptions.find((item) => item.key === query.mr) ?? monthlyReturnFilterOptions[0];
	const base = vaults.filter(
		(vault) =>
			options.includeBlacklisted || query.q.startsWith('blacklist') || risk.maxValue >= 999 || !isBlacklisted(vault)
	);
	const blacklistedVaultsAreHidden =
		!options.includeBlacklisted && !query.q.startsWith('blacklist') && risk.maxValue < 999;
	const blacklistedRisk = riskFilterOptions.find((item) => item.label === 'Blacklisted') ?? risk;
	const threshold = (vault: VaultInfo) =>
		options.showFilters ? (tvl.chainOverrides?.[vault.chain_id] ?? tvl.value) : options.tvlThreshold;
	const matchesFilters = (vault: VaultInfo, riskFilter = risk) => {
		const years = vault.years ?? 0;
		if (options.showFilters && ((age.value > 0 && years < age.value) || (age.maxAge < Infinity && years >= age.maxAge)))
			return false;
		if (options.showFilters && (riskFilter.minValue > 0 || riskFilter.maxValue < Infinity)) {
			if (!matchesVaultRisk(vault, riskFilter)) return false;
		}
		if (options.showFilters && dd.value < Infinity) {
			const maxDrawdown = getLifetimeMaxDrawdown(vault);
			if (maxDrawdown == null || Math.abs(maxDrawdown) > dd.value) return false;
		}
		if (options.showFilters && !matchesVolatilityFilter(vault.three_months_volatility, volatility.value)) return false;
		if (options.showFilters && monthlyReturn.mode !== 'any') {
			const value = getMonthlyReturn(vault);
			if (
				value == null ||
				(monthlyReturn.mode === 'lt' && !(value < monthlyReturn.value)) ||
				(monthlyReturn.mode === 'gt' && !(value > monthlyReturn.value)) ||
				(monthlyReturn.mode === 'gt-treasury' &&
					(options.treasuryRate == null || !(value > options.treasuryRate / 100)))
			)
				return false;
		}
		if (query.closed && vault.deposit_closed_reason != null) return false;
		if (query.unknown && isUnknownVaultProtocol(vault)) return false;
		if (query.amm && isAmmPoolLikeVault(vault)) return false;
		if (query.private && isPermissionedVault(vault)) return false;
		const search = [
			vault.chain_id,
			getChainDisplayName(vault.chain_id),
			vault.name,
			getVaultProtocolDisplayName(vault),
			vault.denomination,
			vault.risk ?? '',
			vault.address
		]
			.join(' ')
			.toLowerCase();
		return search.includes(query.q.trim().toLowerCase());
	};
	const hasTvlFilter = options.filterTvl || options.showFilters;
	const passesTvlFilter = (vault: VaultInfo) =>
		!hasTvlFilter || (getVaultCurrentTvlUsd(vault) ?? 0) >= threshold(vault);
	const matchesWithoutTvl = base.filter((vault) => matchesFilters(vault));
	const hiddenVaults = hasTvlFilter ? matchesWithoutTvl.filter((vault) => !passesTvlFilter(vault)) : [];
	const matches = matchesWithoutTvl.filter(passesTvlFilter);
	const hiddenBlacklistedCount = blacklistedVaultsAreHidden
		? vaults.filter((vault) => isBlacklisted(vault) && matchesFilters(vault, blacklistedRisk) && passesTvlFilter(vault))
				.length
		: 0;
	const stats = options.includeBlacklistedInStats ? matches : matches.filter((vault) => !isBlacklisted(vault));
	const statsWithUsdTvl = stats.map(withVaultCurrentTvlUsd);
	return {
		vaults: sortVaults(matches, query.sort, query.direction, options.ratingProvider),
		hiddenByTvl: hiddenVaults.length,
		hiddenBlacklistedCount,
		hiddenVaults,
		totalTvl: calculateTotalTvl(statsWithUsdTvl, { maxTvlUsd: options.maxSummaryTvlUsd }),
		avgTvlWeightedApy1M: calculateTvlWeightedApy(statsWithUsdTvl, {
			includeBlacklisted: options.includeBlacklistedInStats,
			maxTvlUsd: options.maxSummaryTvlUsd
		})
	};
}

/**
 * Framework-independent vault-listing query helpers.
 *
 * Both SvelteKit loaders and browser compatibility consumers use this module so
 * a page boundary can never sort a different prefix from the server.
 */
import { getChainDisplayName } from '$lib/helpers/chain';
import type { VaultInfo } from '../schemas';
import {
	calculateTotalTvl,
	calculateTvlWeightedApy,
	ageFilterOptions,
	ddFilterOptions,
	getLifetimeMaxDrawdown,
	getMonthlyReturn,
	getVaultCurrentTvlUsd,
	getVaultPeakTvlUsd,
	getVaultProtocolDisplayName,
	hasSupportedProtocol,
	isBlacklisted,
	monthlyReturnFilterOptions,
	rankVaultsBy,
	riskFilterOptions,
	tvlFilterOptions,
	withVaultCurrentTvlUsd
} from '../helpers';
import { compareVaultsByReturn, type ReturnColumnId } from '../return-columns';

export type VaultSortDirection = 'asc' | 'desc';

export interface VaultListingQuery {
	tvl: string;
	age: number;
	risk: number;
	dd: string;
	mr: string;
	q: string;
	closed: boolean;
	unknown: boolean;
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
}

export interface VaultListingResult {
	vaults: VaultInfo[];
	hiddenByTvl: number;
	hiddenVaults: VaultInfo[];
	totalTvl: number;
	avgTvlWeightedApy1M: number | null;
}

function compareStrings(value: (vault: VaultInfo) => string) {
	return (a: VaultInfo, b: VaultInfo) => value(a).localeCompare(value(b));
}

function canonicalKey(vault: VaultInfo): string {
	return vault.id || `${vault.chain_id}:${vault.address.toLowerCase()}`;
}

/** Sort the full matching population using a stable canonical tie-breaker. */
export function sortVaults(vaults: VaultInfo[], sort: string, direction: VaultSortDirection): VaultInfo[] {
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
	const monthlyReturn =
		monthlyReturnFilterOptions.find((item) => item.key === query.mr) ?? monthlyReturnFilterOptions[0];
	const base = vaults.filter(
		(vault) =>
			options.includeBlacklisted || query.q.startsWith('blacklist') || risk.maxValue >= 999 || !isBlacklisted(vault)
	);
	const threshold = (vault: VaultInfo) =>
		options.showFilters ? (tvl.chainOverrides?.[vault.chain_id] ?? tvl.value) : options.tvlThreshold;
	const matchesWithoutTvl = base.filter((vault) => {
		const years = vault.years ?? 0;
		if (options.showFilters && ((age.value > 0 && years < age.value) || (age.maxAge < Infinity && years >= age.maxAge)))
			return false;
		if (options.showFilters && (risk.minValue > 0 || risk.maxValue < Infinity)) {
			if (
				vault.risk_numeric != null
					? vault.risk_numeric < risk.minValue || vault.risk_numeric > risk.maxValue
					: !(risk.minValue === 0 && risk.maxValue >= 50)
			)
				return false;
		}
		if (
			options.showFilters &&
			dd.value < Infinity &&
			(getLifetimeMaxDrawdown(vault) == null || Math.abs(getLifetimeMaxDrawdown(vault)!) > dd.value)
		)
			return false;
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
		if (query.unknown && !hasSupportedProtocol(vault)) return false;
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
	});
	const hiddenVaults =
		options.filterTvl || options.showFilters
			? matchesWithoutTvl.filter((vault) => (getVaultCurrentTvlUsd(vault) ?? 0) < threshold(vault))
			: [];
	const matches =
		options.filterTvl || options.showFilters
			? matchesWithoutTvl.filter((vault) => (getVaultCurrentTvlUsd(vault) ?? 0) >= threshold(vault))
			: matchesWithoutTvl;
	const stats = options.includeBlacklistedInStats ? matches : matches.filter((vault) => !isBlacklisted(vault));
	const statsWithUsdTvl = stats.map(withVaultCurrentTvlUsd);
	return {
		vaults: sortVaults(matches, query.sort, query.direction),
		hiddenByTvl: hiddenVaults.length,
		hiddenVaults,
		totalTvl: calculateTotalTvl(statsWithUsdTvl, { maxTvlUsd: options.maxSummaryTvlUsd }),
		avgTvlWeightedApy1M: calculateTvlWeightedApy(statsWithUsdTvl, {
			includeBlacklisted: options.includeBlacklistedInStats,
			maxTvlUsd: options.maxSummaryTvlUsd
		})
	};
}

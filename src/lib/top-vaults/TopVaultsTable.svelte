<!--
@component
Interactive vault listing with filters, sorting, and progressive row loading.

Use `ratingProvider` to add its risk-rating column beside the vault name.
Permissioned vaults are marked as Private, except tokenised funds, which are marked as Fund.
The Private checkbox in the Hide vaults group excludes all permissioned vaults.
The AMM checkbox hides AMM pools and AMM-like vaults on listings with Filters.
-->
<script lang="ts">
	import type { Chain } from '$lib/helpers/chain';
	import type { TopVaults, VaultInfo } from './schemas';
	import type { RiskRatingProvider } from './risk-rating-providers';
	import type { ParamSchema } from '$lib/helpers/url-search-state';
	import { onMount, untrack } from 'svelte';
	import { goto, replaceState } from '$app/navigation';
	import { page } from '$app/state';
	import { inview } from 'svelte-inview';
	import { resolve } from '$app/paths';
	import { deserialiseSearchParams, serialiseSearchParams } from '$lib/helpers/url-search-state';
	import Select from '$lib/components/Select.svelte';
	import TargetableLink from '$lib/components/TargetableLink.svelte';
	import Timestamp from '$lib/components/Timestamp.svelte';
	import Tooltip from '$lib/components/Tooltip.svelte';
	import Spinner from '$lib/components/Spinner.svelte';
	import ChainCell from './ChainCell.svelte';
	import Core3RiskCell from './Core3RiskCell.svelte';
	import FeesCell from './FeesCell.svelte';
	import RiskCell from './RiskCell.svelte';
	import VaultSparkline from './VaultSparkline.svelte';
	import IconChevronUp from '~icons/local/chevron-up';
	import IconChevronDown from '~icons/local/chevron-down';
	import IconHourglass from '~icons/local/hourglass';
	import IconStop from '~icons/local/stop';
	import { getChain, getChainDisplayName } from '$lib/helpers/chain';
	import {
		formatDollar,
		formatNumber,
		formatPercent,
		formatPercentProfit,
		formatTokenAmount,
		formatValue,
		notFilledMarker
	} from '$lib/helpers/formatters';
	import { isStablecoinDepegged } from '$lib/stablecoin-metadata/helpers';
	import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';
	import {
		DEFAULT_TVL_KEY,
		DEFAULT_TVL_THRESHOLD,
		ageFilterOptions,
		calculateTotalTvl,
		calculateTvlWeightedApy,
		ddFilterOptions,
		getLockupDescription,
		getFormattedLockup,
		getCore3PolForVault,
		getLockupTooltip,
		getLifetimeMaxDrawdown,
		getMonthlyReturn,
		getVaultProtocolDisplayName,
		getVaultCurrentTvlUsd,
		getVaultDenominationNativeRate,
		getVaultDenominationCurrency,
		getVaultPeakTvlUsd,
		getVaultTvlNative,
		hasSupportedProtocol,
		isAmmPoolLikeVault,
		isBlacklisted,
		isPermissionedVault,
		isVaultDepositCapped,
		isGoodVaultStatus,
		matchesVolatilityFilter,
		monthlyReturnFilterOptions,
		rankVaultsBy,
		resolveVaultDetails,
		riskFilterOptions,
		tvlFilterOptions,
		volatilityFilterOptions
	} from './helpers';
	import {
		DEFAULT_RETURN_COLUMN_IDS,
		LEGACY_RETURN_SORT_ALIASES,
		canonicaliseReturnSortKey,
		compareVaultsByReturn,
		getReturnDataCoverage,
		getReturnLifetimeData,
		getReturnColumnValues,
		isReturnSortKey,
		returnColumnDefinitionMap,
		returnColumnDefinitions,
		sanitiseReturnColumnSelection,
		serialiseReturnColumnSelection,
		toggleReturnColumnSelection,
		type ReturnColumnDefinition,
		type ReturnColumnId
	} from './return-columns';
	import { sortVaults } from './listing/query';
	import { getVaultListingDefaults, type VaultListingKey } from './listing/definitions';
	import { INITIAL_VAULT_LISTING_LIMIT, VAULT_LISTING_PAGE_SIZE, type VaultListingSummary } from './listing/types';

	const allVaultsPath = resolve('/vaults/all');
	const filtersOpenStorageKey = 'top-vaults-filters-open';
	const filterSearchParamKeys = [
		'tvl',
		'age',
		'risk',
		'q',
		'closed',
		'unknown',
		'amm',
		'private',
		'dd',
		'vol',
		'mr',
		'returns'
	] as const;

	/** Return whether the URL explicitly contains a vault-table filtering parameter. */
	function hasFilterSearchParams(searchParams: URLSearchParams) {
		return filterSearchParamKeys.some((key) => searchParams.has(key));
	}

	interface SortOptions {
		key: string;
		direction: 'asc' | 'desc';
		compareFn: (a: VaultInfo, b: VaultInfo) => number;
	}
	type SortColumnDefinition = {
		defaultDirection: SortOptions['direction'];
		compareFn: SortOptions['compareFn'];
	};

	interface Props {
		topVaults?: TopVaults;
		chain?: Chain;
		tvlThreshold?: number;
		tvlTriggerLabel?: string;
		tvlTooltip?: string;
		filterTvl?: boolean;
		includeBlacklisted?: boolean;
		/** Show the vault-table Filters disclosure. */
		showFilters?: boolean;
		/** Default TVL filter key (used to initialise the dropdown when showFilters is true) */
		defaultTvlKey?: string;
		/** Default age filter index (used to initialise the dropdown when showFilters is true) */
		defaultAgeIndex?: number;
		/** Default risk filter index (used to initialise the dropdown when showFilters is true) */
		defaultRiskIndex?: number;
		/** Default value for the Unknown protocols checkbox in the Hide vaults group (1 = hide, 0 = show) */
		defaultHideUnknown?: number;
		/** Show the Unknown protocols checkbox in the Hide vaults group */
		showUnknownFilter?: boolean;
		/** Show the Private permissioned-vault checkbox in the Hide vaults group */
		showPrivateFilter?: boolean;
		/** Default monthly return filter key */
		defaultMonthlyReturnKey?: string;
		/** Default sort column key */
		defaultSort?: string;
		/** Default sort direction */
		defaultDirection?: 'asc' | 'desc';
		/** Show skeleton loading state while vault data is being fetched */
		loading?: boolean;
		/** Override for the "out of {total}" listing meta; defaults to the vaults passed in (use to show the whole-database count on pre-filtered listings) */
		totalVaultCount?: number;
		/** Include blacklisted vaults in the listing summary stats. */
		includeBlacklistedInStats?: boolean;
		/** Exclude vaults above this TVL from listing summary TVL and TVL-weighted stats. */
		maxSummaryTvlUsd?: number;
		/** Do not visually strike through blacklisted vault rows. */
		disableBlacklistedStrikethrough?: boolean;
		/** Show a third-party risk rating column immediately after the vault name. */
		ratingProvider?: RiskRatingProvider;
		/** Whether rows are fetched in pages from the server. */
		progressive?: boolean;
		listingKey?: VaultListingKey;
		listingScope?: string;
		listingSummary?: VaultListingSummary;
	}

	interface ListingDataResponse {
		vaults: VaultInfo[];
		nextOffset: number;
		hasMore: boolean;
		listingSummary: VaultListingSummary;
	}

	const emptyTopVaults: TopVaults = {
		generated_at: new Date().toISOString(),
		vaults: [],
		core3_protocols: {},
		curators: {}
	};
	const SKELETON_ROW_COUNT = 10;
	const skeletonRows = Array.from({ length: SKELETON_ROW_COUNT }, (_, index) => index);

	let {
		topVaults = emptyTopVaults,
		chain,
		tvlThreshold = DEFAULT_TVL_THRESHOLD,
		tvlTriggerLabel,
		tvlTooltip,
		filterTvl,
		includeBlacklisted = false,
		showFilters = false,
		defaultTvlKey = DEFAULT_TVL_KEY,
		defaultAgeIndex = 0,
		defaultRiskIndex = 1,
		defaultHideUnknown = 1,
		showUnknownFilter = true,
		showPrivateFilter = true,
		defaultMonthlyReturnKey = 'any',
		defaultSort,
		defaultDirection,
		loading = false,
		totalVaultCount: totalVaultCountProp,
		includeBlacklistedInStats = false,
		maxSummaryTvlUsd,
		disableBlacklistedStrikethrough = false,
		ratingProvider,
		progressive = false,
		listingKey = 'top',
		listingScope,
		listingSummary
	}: Props = $props();
	const defaultHideAmm = untrack(() => ((getVaultListingDefaults(listingKey, listingScope).amm ?? true) ? 1 : 0));
	let accumulatedVaults = $state<VaultInfo[]>(topVaults.vaults);
	let remoteHasMore = $state(progressive);
	let remoteLoading = $state(false);
	let remoteOffset = $state(topVaults.vaults.length);
	let revealedBlacklistedVaults = $state<VaultInfo[]>([]);
	let revealedListingSummary = $state<VaultListingSummary>();
	$effect(() => {
		accumulatedVaults = topVaults.vaults;
		remoteOffset = topVaults.vaults.length;
		remoteHasMore = progressive;
	});
	$effect(() => {
		listingSummary;
		revealedListingSummary = undefined;
	});

	// --- Sort column registry (key → compareFn + default direction) ---

	function stringCompare(fn: (v: VaultInfo) => string) {
		return (a: VaultInfo, b: VaultInfo) => fn(a).localeCompare(fn(b));
	}

	function getProviderRiskScore(vault: VaultInfo): number | null {
		if (ratingProvider === 'xerberus') return vault.xerberus?.score ?? null;
		if (ratingProvider === 'core3') return getCore3PolForVault(vault, topVaults.core3_protocols)?.score ?? null;
		return null;
	}

	function getXerberusRiskRating(vault: VaultInfo): string {
		const score = vault.xerberus?.score;
		if (score == null) return notFilledMarker;
		return formatNumber(score, 0, 0);
	}

	function compareProviderRiskRatings(a: VaultInfo, b: VaultInfo): number {
		const aScore = getProviderRiskScore(a);
		const bScore = getProviderRiskScore(b);
		if (aScore == null && bScore == null) return 0;

		const missingScore = ratingProvider === 'xerberus' ? -Infinity : Infinity;
		return (aScore ?? missingScore) - (bScore ?? missingScore);
	}

	const returnSortColumnMap = Object.fromEntries(
		returnColumnDefinitions.map((definition) => [
			definition.id,
			{
				defaultDirection: definition.sortDirection,
				compareFn: compareVaultsByReturn(definition.id)
			}
		])
	) as Record<ReturnColumnId, SortColumnDefinition>;

	// The provider is a page-level configuration and does not change after the table mounts.
	const providerSortColumnMap = untrack((): Record<string, SortColumnDefinition> => {
		if (!ratingProvider) return {};
		return { provider_risk_rating: { defaultDirection: 'asc', compareFn: compareProviderRiskRatings } };
	});

	const sortColumnMap: Record<string, SortColumnDefinition> = {
		...returnSortColumnMap,
		chain: {
			defaultDirection: 'asc',
			compareFn: stringCompare((v) => getChainDisplayName(v.chain_id))
		},
		vault: {
			defaultDirection: 'asc',
			compareFn: stringCompare((v) => `${v.name.trim()} ${getVaultProtocolDisplayName(v)}`)
		},
		three_months_sharpe: { defaultDirection: 'desc', compareFn: rankVaultsBy(['three_months_sharpe']) },
		three_months_volatility: { defaultDirection: 'asc', compareFn: rankVaultsBy(['three_months_volatility']) },
		max_dd: {
			defaultDirection: 'desc',
			compareFn: (a: VaultInfo, b: VaultInfo) => {
				const aVal = getLifetimeMaxDrawdown(a) ?? -Infinity;
				const bVal = getLifetimeMaxDrawdown(b) ?? -Infinity;
				return aVal - bVal;
			}
		},
		denomination: { defaultDirection: 'asc', compareFn: stringCompare((v) => v.denomination) },
		tvl: {
			defaultDirection: 'desc',
			compareFn: (a: VaultInfo, b: VaultInfo) =>
				rankVaultsBy(['current_tvl_usd', 'peak_tvl_usd'])(
					{ current_tvl_usd: getVaultCurrentTvlUsd(a), peak_tvl_usd: getVaultPeakTvlUsd(a) },
					{ current_tvl_usd: getVaultCurrentTvlUsd(b), peak_tvl_usd: getVaultPeakTvlUsd(b) }
				)
		},
		age: { defaultDirection: 'desc', compareFn: rankVaultsBy(['years']) },
		fees: { defaultDirection: 'asc', compareFn: rankVaultsBy(['mgmt_fee', 'perf_fee'], Infinity) },
		lockup: { defaultDirection: 'asc', compareFn: rankVaultsBy(['lockup'], Infinity) },
		risk: { defaultDirection: 'asc', compareFn: rankVaultsBy(['risk_numeric'], Infinity) },
		...providerSortColumnMap
	};

	// --- URL search state schema ---

	const searchParamsSchema = {
		tvl: { type: 'string', defaultValue: defaultTvlKey, options: tvlFilterOptions.map((o) => o.key) },
		age: { type: 'number', defaultValue: defaultAgeIndex },
		risk: { type: 'number', defaultValue: defaultRiskIndex },
		sort: {
			type: 'string',
			defaultValue: defaultSort ?? DEFAULT_RETURN_COLUMN_IDS[0],
			options: [...Object.keys(sortColumnMap), ...Object.keys(LEGACY_RETURN_SORT_ALIASES)]
		},
		direction: { type: 'string', defaultValue: defaultDirection ?? 'desc', options: ['asc', 'desc'] },
		q: { type: 'string', defaultValue: '' },
		closed: { type: 'number', defaultValue: 0 },
		unknown: { type: 'number', defaultValue: defaultHideUnknown },
		amm: { type: 'number', defaultValue: defaultHideAmm },
		private: { type: 'number', defaultValue: 0 },
		dd: { type: 'string', defaultValue: 'any', options: ddFilterOptions.map((o) => o.key) },
		vol: { type: 'string', defaultValue: 'any', options: volatilityFilterOptions.map((o) => o.key) },
		mr: {
			type: 'string',
			defaultValue: defaultMonthlyReturnKey,
			options: monthlyReturnFilterOptions.map((o) => o.key)
		},
		returns: { type: 'string', defaultValue: DEFAULT_RETURN_COLUMN_IDS.join(',') }
	} as const satisfies ParamSchema;

	let urlState = $derived(deserialiseSearchParams(page.url.searchParams, searchParamsSchema));
	/** URL state changes shallowly while revealing hidden rows, without a page navigation. */
	let riskOverride = $state<number | null>(null);

	/** Update URL search params, merging overrides with current state */
	function getSearchUrl(overrides: Partial<typeof urlState>) {
		const current = deserialiseSearchParams(page.url.searchParams, searchParamsSchema);
		const updated = { ...current, ...(riskOverride == null ? {} : { risk: riskOverride }), ...overrides };
		const queryString = serialiseSearchParams(updated, searchParamsSchema);
		return `${page.url.pathname}?${queryString}`;
	}

	function updateSearchParams(overrides: Partial<typeof urlState>) {
		if ('risk' in overrides) riskOverride = null;
		return goto(getSearchUrl(overrides), {
			replaceState: true,
			noScroll: true,
			keepFocus: true
		});
	}

	/** Reveal the hidden rows without reloading the listing page. */
	async function showBlacklistedVaults() {
		if (remoteLoading) return;

		const targetUrl = getSearchUrl({ risk: blacklistedRiskIndex });
		const targetSearchParams = new URL(targetUrl, page.url.origin).searchParams;
		remoteLoading = true;
		try {
			const next = await fetchListingData(targetSearchParams, 0, true);
			if (next == null) {
				riskOverride = null;
				await goto(targetUrl, { invalidateAll: true, replaceState: true, noScroll: true, keepFocus: true });
				return;
			}

			const seen = new Set(accumulatedVaults.map((vault) => vault.id));
			revealedBlacklistedVaults = next.vaults.filter((vault) => !seen.has(vault.id));
			remoteHasMore = next.hasMore;
			revealedListingSummary = next.listingSummary;
			riskOverride = blacklistedRiskIndex;
			replaceState(targetUrl, {});
		} finally {
			remoteLoading = false;
		}
	}

	// --- Filter state (derived from URL) ---

	let selectedTvlKey = $derived(urlState.tvl);
	let selectedTvlOption = $derived(tvlFilterOptions.find((o) => o.key === selectedTvlKey)!);
	let tvlDropdownOpen = $state(false);

	let selectedAgeIndex = $derived(urlState.age);
	let selectedAge = $derived(ageFilterOptions[selectedAgeIndex]);

	let selectedRiskIndex = $derived(riskOverride ?? urlState.risk);
	let selectedRisk = $derived(riskFilterOptions[selectedRiskIndex]);
	const blacklistedRiskIndex = riskFilterOptions.findIndex((option) => option.label === 'Blacklisted');
	let riskDropdownOpen = $state(false);
	let selectedDdKey = $derived(urlState.dd);
	let selectedDdOption = $derived(ddFilterOptions.find((o) => o.key === selectedDdKey)!);
	let ddDropdownOpen = $state(false);
	let selectedVolatilityKey = $derived(urlState.vol);
	let selectedVolatilityOption = $derived(volatilityFilterOptions.find((o) => o.key === selectedVolatilityKey)!);
	let volatilityDropdownOpen = $state(false);

	let selectedMrKey = $derived(urlState.mr);
	let selectedMrOption = $derived(monthlyReturnFilterOptions.find((o) => o.key === selectedMrKey)!);
	let mrDropdownOpen = $state(false);

	/** Treasury note annual rate (percentage, e.g. 4.25) from layout server data */
	let treasuryRate = $derived((page.data as { treasuryRate?: number | null }).treasuryRate ?? null);

	let hideClosed = $derived(urlState.closed === 1);
	let hideUnknown = $derived(showUnknownFilter && urlState.unknown === 1);
	let hideAmm = $derived(showFilters && urlState.amm === 1);
	let hidePrivate = $derived(urlState.private === 1);
	let returnsDropdownOpen = $state(false);
	let filtersOpen = $state(hasFilterSearchParams(page.url.searchParams));
	let hasLoadedFilterPreference = false;
	let selectedReturnColumnIds = $derived(sanitiseReturnColumnSelection(urlState.returns));
	let selectedReturnColumns = $derived(
		selectedReturnColumnIds.map(
			(id) => returnColumnDefinitionMap[id] ?? returnColumnDefinitionMap[DEFAULT_RETURN_COLUMN_IDS[0]]
		)
	);
	let selectedReturnsLabel = $derived(
		selectedReturnColumns.length > 0 ? selectedReturnColumns.map((item) => item.shortLabel).join(', ') : 'None'
	);
	let showAllVaultsFilterNote = $derived(page.url.pathname !== allVaultsPath);

	/** Save the user's explicit Filters disclosure choice for other vault listings. */
	function saveFiltersOpenPreference() {
		if (hasLoadedFilterPreference) {
			window.localStorage.setItem(filtersOpenStorageKey, String(filtersOpen));
		}
	}

	function toggleFilters() {
		filtersOpen = !filtersOpen;
		saveFiltersOpenPreference();
	}

	function toggleDesktopFilters(event: MouseEvent) {
		event.preventDefault();
		toggleFilters();
	}

	// Keep the disclosure preference while moving between vault listings. Filtered
	// URLs open the disclosure on arrival without changing that saved preference.
	onMount(() => {
		filtersOpen =
			hasFilterSearchParams(page.url.searchParams) || window.localStorage.getItem(filtersOpenStorageKey) === 'true';
		hasLoadedFilterPreference = true;
	});

	// Preserve support for existing URL text-search links without exposing a listing-page search field.
	let filterValue = $derived(urlState.q);

	// --- Sort state (derived from URL) ---

	$effect(() => {
		const normalisedReturns = serialiseReturnColumnSelection(selectedReturnColumnIds);
		const canonicalSort = canonicaliseReturnSortKey(urlState.sort);

		if (urlState.returns !== normalisedReturns) {
			updateSearchParams({ returns: normalisedReturns });
			return;
		}

		if (canonicalSort && urlState.sort !== canonicalSort) {
			updateSearchParams({ sort: canonicalSort });
			return;
		}

		if (canonicalSort && !selectedReturnColumnIds.includes(canonicalSort) && selectedReturnColumnIds.length > 0) {
			updateSearchParams({ sort: selectedReturnColumnIds[0], direction: 'desc' });
		}
	});

	let sortOptions: SortOptions = $derived.by(() => {
		const sortKey = canonicaliseReturnSortKey(urlState.sort) ?? urlState.sort;
		const column = sortColumnMap[sortKey];
		if (!column) {
			return {
				key: DEFAULT_RETURN_COLUMN_IDS[0],
				direction: 'desc' as const,
				compareFn: sortColumnMap[DEFAULT_RETURN_COLUMN_IDS[0]].compareFn
			};
		}
		return { key: sortKey, direction: urlState.direction as 'asc' | 'desc', compareFn: column.compareFn };
	});

	let showChainCol = $derived(!chain);
	let showProviderRiskRating = $derived(ratingProvider != null);
	let showTechnicalRisk = $derived(ratingProvider == null);

	let offsetWidth = $state<number>();

	const VOLATILITY_CAP = 9.99; // 999% in decimal form
	const VOLATILITY_CAP_LABEL = '>999%';
	const RETURN_TOOLTIP_THRESHOLD = 1; // 100% in decimal form

	const formatReturn = (v: MaybeNumber) => formatPercentProfit(v, 1);
	const formatTvl = (v: MaybeNumber) => formatDollar(v, 2);
	const formatTvlTokenAmount = (v: MaybeNumber, symbol: string) =>
		v == null ? notFilledMarker : `${formatTokenAmount(v, 2)} ${symbol}`;
	const formatVolatility = (v: MaybeNumber) => {
		if (v == null) return notFilledMarker;
		if (Math.abs(v) > VOLATILITY_CAP) return VOLATILITY_CAP_LABEL;
		return formatPercent(v, 1);
	};

	function isFinitePositiveNumber(value: number | null | undefined): value is number {
		return typeof value === 'number' && Number.isFinite(value) && value > 0;
	}

	function getVaultUsdRate(vault: VaultInfo): number | null {
		const rate = vault.denomination_token_rate?.usd_rate;
		return isFinitePositiveNumber(rate) ? rate : null;
	}

	function getVaultNativeRate(vault: VaultInfo): number | null {
		return getVaultDenominationNativeRate(vault);
	}

	function formatNativeTvl(vault: VaultInfo, nav: number | null): string {
		const currency = getVaultDenominationCurrency(vault);
		if (!currency) return notFilledMarker;
		const nativeTvl = getVaultTvlNative(vault, nav);
		return nativeTvl == null ? notFilledMarker : `${formatTokenAmount(nativeTvl, 2)} ${currency.toUpperCase()}`;
	}

	function formatVaultExchangeRate(vault: VaultInfo): string {
		const usdRate = getVaultUsdRate(vault);
		if (usdRate == null) return notFilledMarker;

		const currency = getVaultDenominationCurrency(vault);
		const nativeRate = getVaultNativeRate(vault);
		const nativeText =
			currency && currency !== 'usd' && nativeRate != null
				? ` (${formatTokenAmount(nativeRate, 4, 6)} ${currency.toUpperCase()})`
				: '';

		return `1 ${vault.denomination} = ${formatDollar(usdRate, 4, 6)}${nativeText}`;
	}

	function shouldShowTvlBreakdown(vault: VaultInfo): boolean {
		const currency = getVaultDenominationCurrency(vault);
		return currency != null && currency !== 'usd' ? true : isStablecoinDepegged(vault);
	}

	// Filter out blacklisted vaults unless explicitly included, searched for, or selected by risk level.
	let baseVaults = $derived.by(() => {
		const sourceVaults = progressive
			? [...accumulatedVaults, ...revealedBlacklistedVaults]
			: [...topVaults.vaults, ...revealedBlacklistedVaults];
		if (includeBlacklisted || filterValue.startsWith('blacklist') || selectedRisk.maxValue >= 999) {
			return sourceVaults;
		}
		return sourceVaults.filter((v) => !isBlacklisted(v));
	});

	/** Resolve the effective TVL threshold for a vault, accounting for chain overrides */
	function getVaultTvlThreshold(vault: VaultInfo): number {
		if (showFilters) {
			return selectedTvlOption.chainOverrides?.[vault.chain_id] ?? selectedTvlOption.value;
		}
		return tvlThreshold;
	}

	function getVaultCurrentTvl(vault: VaultInfo): number {
		return getVaultCurrentTvlUsd(vault) ?? 0;
	}

	// Get vaults hidden due to TVL threshold (only when filtering is enabled)
	let hiddenVaults = $derived.by(() => {
		if (!filterTvl && !showFilters) return [];
		return baseVaults.filter((v) => getVaultCurrentTvl(v) < getVaultTvlThreshold(v));
	});
	// The server summary also provides the hidden-blacklisted count when the
	// unfiltered result fits in the initial batch (and is therefore not progressive).
	let serverListingSummary = $derived(revealedListingSummary ?? listingSummary);
	let blacklistedVaultsAreHidden = $derived(
		!includeBlacklisted && !filterValue.startsWith('blacklist') && selectedRisk.maxValue < 999
	);
	let hiddenBlacklistedCount = $derived(
		serverListingSummary?.hiddenBlacklistedCount ??
			(blacklistedVaultsAreHidden
				? (progressive ? accumulatedVaults : topVaults.vaults).filter(isBlacklisted).length
				: 0)
	);
	let hiddenVaultNames = $derived(
		serverListingSummary?.hiddenVaultNames ?? hiddenVaults.slice(0, 2).map((vault) => vault.name)
	);

	// Count of hidden vaults
	let hiddenByTvl = $derived(serverListingSummary?.hiddenByTvl ?? hiddenVaults.length);

	// Total vault count for the listing meta — the whole-database count when
	// provided by the page, otherwise the vaults available to this listing
	let totalVaultCount = $derived(totalVaultCountProp ?? topVaults.vaults.length);

	// Filter vaults matching all active listing filters.
	let filteredVaults = $derived.by(() => {
		const filterCompareStr = filterValue.trim().toLowerCase();
		return baseVaults.filter((v) => {
			// TVL filter (prop-driven or dropdown-driven)
			if (filterTvl || showFilters) {
				if (getVaultCurrentTvl(v) < getVaultTvlThreshold(v)) {
					return false;
				}
			}

			// Age filter (dropdown-driven)
			if (showFilters) {
				const years = v.years ?? 0;
				if (selectedAge.value > 0 && years < selectedAge.value) return false;
				if (selectedAge.maxAge < Infinity && years >= selectedAge.maxAge) return false;
			}

			// Risk filter (dropdown-driven) — check both min and max bounds
			if (showFilters && (selectedRisk.minValue > 0 || selectedRisk.maxValue < Infinity)) {
				if (v.risk_numeric != null) {
					if (v.risk_numeric < selectedRisk.minValue || v.risk_numeric > selectedRisk.maxValue) return false;
				} else {
					// Hide unknown-risk vaults unless filter is Dangerous or Blacklisted
					if (!(selectedRisk.minValue === 0 && selectedRisk.maxValue >= 50)) return false;
				}
			}

			// Max drawdown filter (dropdown-driven)
			if (showFilters && selectedDdOption.value < Infinity) {
				const dd = getLifetimeMaxDrawdown(v);
				if (dd == null || Math.abs(dd) > selectedDdOption.value) return false;
			}

			// Three-month annualised volatility filter (dropdown-driven)
			if (showFilters && !matchesVolatilityFilter(v.three_months_volatility, selectedVolatilityOption.value))
				return false;

			// Monthly returns filter (dropdown-driven)
			if (showFilters && selectedMrOption.mode !== 'any') {
				const mr = getMonthlyReturn(v);
				if (mr == null) return false;
				if (selectedMrOption.mode === 'lt' && !(mr < selectedMrOption.value)) return false;
				if (selectedMrOption.mode === 'gt' && !(mr > selectedMrOption.value)) return false;
				if (selectedMrOption.mode === 'gt-treasury') {
					if (treasuryRate == null) return false;
					if (!(mr > treasuryRate / 100)) return false;
				}
			}

			// Hide closed filter (checkbox-driven)
			if (hideClosed && v.deposit_closed_reason != null) return false;

			// Hide unknown protocol filter (checkbox-driven)
			if (hideUnknown && !hasSupportedProtocol(v)) return false;

			// Hide AMM pool filter (checkbox-driven)
			if (hideAmm && isAmmPoolLikeVault(v)) return false;

			// Hide private vault filter (checkbox-driven)
			if (hidePrivate && isPermissionedVault(v)) return false;

			const vaultCompareStr = [
				v.chain_id,
				getChainDisplayName(v.chain_id),
				v.name,
				getVaultProtocolDisplayName(v),
				v.denomination,
				v.risk ?? '',
				v.address
			].join(' ');
			return vaultCompareStr.toLowerCase().includes(filterCompareStr);
		});
	});

	// A progressive listing contains only its initial page here, while the server
	// summary describes every vault matching the same filters.
	let matchingVaultCount = $derived(serverListingSummary?.matchingCount ?? filteredVaults.length);

	// Uses filteredVaults so all active filters (TVL, age, risk, search) are reflected in the stats row.
	let statsVaults = $derived(
		includeBlacklistedInStats ? filteredVaults : filteredVaults.filter((v) => !isBlacklisted(v))
	);

	let statsVaultsWithTvl = $derived(
		statsVaults.map((v) => ({
			...v,
			current_nav: getVaultCurrentTvlUsd(v)
		}))
	);

	// Calculate total TVL from fully-filtered vaults
	let totalTvl = $derived(
		serverListingSummary
			? serverListingSummary.totalTvl
			: calculateTotalTvl(statsVaultsWithTvl, { maxTvlUsd: maxSummaryTvlUsd })
	);

	// A progressive listing only contains its initial row batch in the browser.
	// Use the server calculation over the complete filtered listing so the headline
	// does not become skewed by the current batch or its sort order.
	let avgTvlWeightedApy1M = $derived(
		serverListingSummary
			? serverListingSummary.avgTvlWeightedApy1M
			: calculateTvlWeightedApy(statsVaultsWithTvl, {
					includeBlacklisted: includeBlacklistedInStats,
					maxTvlUsd: maxSummaryTvlUsd
				})
	);

	// sort vaults
	let sortedVaults = $derived.by(() => {
		if (progressive && sortOptions.key !== 'provider_risk_rating')
			return sortVaults(filteredVaults, sortOptions.key, sortOptions.direction);
		const sorted = filteredVaults.toSorted(sortOptions.compareFn);
		if (sortOptions.direction === 'desc') sorted.reverse();
		return sorted;
	});

	// INFINITE SCROLL:
	// - limit the displayed vaults during initial render
	// - track sortedVaults as dependency (reset to initial count when it changes)
	// - progressively increemnt maxVisibleRows on-scroll (see load-more-sentinel)
	let maxVisibleRows = $state(INITIAL_VAULT_LISTING_LIMIT);
	let visibleVaults = $derived(progressive ? sortedVaults : sortedVaults.slice(0, maxVisibleRows));
	let hasMoreRows = $derived(progressive ? remoteHasMore : maxVisibleRows < sortedVaults.length);

	async function fetchListingData(
		searchParams: URLSearchParams,
		offset: number,
		onlyBlacklisted = false
	): Promise<ListingDataResponse | null> {
		const params = new URLSearchParams(searchParams);
		params.set('listing', listingKey);
		if (listingScope) params.set('scope', listingScope);
		params.set('offset', String(offset));
		params.set('version', new Date(topVaults.generated_at).toISOString());
		if (onlyBlacklisted) params.set('blacklisted', '1');

		const response = await fetch(`/top-vaults/listing-data?${params}`);
		if (response.status === 409) return null;
		if (!response.ok) throw new Error(`Vault listing continuation failed: ${response.status}`);
		return (await response.json()) as ListingDataResponse;
	}

	async function loadMore() {
		if (!progressive) {
			maxVisibleRows += VAULT_LISTING_PAGE_SIZE;
			return;
		}
		if (remoteLoading || !remoteHasMore) return;
		remoteLoading = true;
		try {
			const loadingRevealedBlacklisted = riskOverride === blacklistedRiskIndex;
			const searchParams = loadingRevealedBlacklisted
				? new URL(getSearchUrl({}), page.url.origin).searchParams
				: page.url.searchParams;
			const offset = loadingRevealedBlacklisted ? revealedBlacklistedVaults.length : remoteOffset;
			const next = await fetchListingData(searchParams, offset, loadingRevealedBlacklisted);
			if (next == null) {
				await goto(getSearchUrl({}), {
					invalidateAll: true,
					replaceState: true,
					noScroll: true,
					keepFocus: true
				});
				return;
			}
			if (loadingRevealedBlacklisted) {
				const seen = new Set([...accumulatedVaults, ...revealedBlacklistedVaults].map((vault) => vault.id));
				revealedBlacklistedVaults = [
					...revealedBlacklistedVaults,
					...next.vaults.filter((vault) => !seen.has(vault.id))
				];
				remoteHasMore = next.hasMore;
				return;
			}
			const seen = new Set(accumulatedVaults.map((vault) => vault.id));
			accumulatedVaults = [...accumulatedVaults, ...next.vaults.filter((vault) => !seen.has(vault.id))];
			remoteOffset = next.nextOffset;
			remoteHasMore = next.hasMore;
		} finally {
			remoteLoading = false;
		}
	}

	function sortBy(key: SortOptions['key'], defaultDirection: SortOptions['direction']) {
		let direction = defaultDirection;
		if (sortOptions.key === key) {
			direction = sortOptions.direction === 'asc' ? 'desc' : 'asc';
		}
		updateSearchParams({ sort: key, direction });
	}

	function updateReturnColumns(nextSelection: ReturnColumnId[]) {
		const nextReturns = serialiseReturnColumnSelection(nextSelection);
		const canonicalSort = canonicaliseReturnSortKey(urlState.sort);

		if (canonicalSort && !nextSelection.includes(canonicalSort) && nextSelection.length > 0) {
			updateSearchParams({ returns: nextReturns, sort: nextSelection[0], direction: 'desc' });
			return;
		}

		updateSearchParams({ returns: nextReturns });
	}

	function onReturnColumnToggle(id: ReturnColumnId) {
		updateReturnColumns(toggleReturnColumnSelection(selectedReturnColumnIds, id));
	}

	function getReturnCellClass(definition: ReturnColumnDefinition) {
		return `return-column return-column-${definition.id}`;
	}

	/** Svelte action to close dropdown on outside clicks */
	function clickOutside(node: HTMLElement, callback: () => void) {
		function handleClick(event: MouseEvent) {
			if (!node.contains(event.target as Node)) {
				callback();
			}
		}
		document.addEventListener('click', handleClick, true);
		return {
			destroy() {
				document.removeEventListener('click', handleClick, true);
			}
		};
	}
</script>

{#snippet sortColHeader(label: string, key: string, direction: SortOptions['direction'])}
	<th class={isReturnSortKey(key) ? `return-column return-column-${canonicaliseReturnSortKey(key)}` : key}>
		<button onclick={() => sortBy(key, direction)}>
			<!-- eslint-disable-next-line svelte/no-at-html-tags -->
			{@html label}
		</button>
		{#if sortOptions.key === key}
			{#if sortOptions.direction === 'asc'}
				<IconChevronUp />
			{:else}
				<IconChevronDown />
			{/if}
		{/if}
	</th>
{/snippet}

{#snippet netGrossCell<T = MaybeNumber>(
	net: T,
	gross: T,
	formatter: Formatter<T>,
	showAnnualisedTooltip = true,
	limitedData: { startDate: string; endDate: string; totalDays: number } | null = null,
	lifetimeData: { startDate: string; endDate: string; totalDays: number } | null = null
)}
	{@const value = net ?? gross}
	{@const capped = showAnnualisedTooltip && typeof value === 'number' && Math.abs(value) > RETURN_TOOLTIP_THRESHOLD}
	{@const missingFees = net === null && gross !== null}
	{#if value === null}
		---
	{:else if limitedData || lifetimeData || capped || missingFees}
		<Tooltip>
			<svelte:fragment slot="trigger">
				<span class:capped-hint={capped}>{formatter(value)}{missingFees ? '*' : ''}</span>
			</svelte:fragment>
			<svelte:fragment slot="popup">
				{#if limitedData}
					<p>Limited data availability.</p>
					<p>Period {limitedData.startDate} - {limitedData.endDate}.</p>
					<p>Total {limitedData.totalDays} days.</p>
				{/if}
				{#if lifetimeData}
					<p>Data starts: {lifetimeData.startDate}</p>
					<p>Data ends: {lifetimeData.endDate}</p>
					<p>Days of data: {lifetimeData.totalDays}</p>
				{/if}
				{#if capped}
					<p>
						Trading vaults, like those on Hyperliquid and GRVT, are highly volatile, and their annualised short-term
						returns may not reflect the long-term performance. For these vaults, use the longer time window to compare
						the results.
					</p>
					<p>
						Another cause for abnormal short term returns is low settlement frequency, as some vaults do not report
						returns daily, one sees monthly spikes.
					</p>
				{/if}
				{#if missingFees}
					<p>
						Fee information for this protocol is not yet available. The calculation is based on gross profit and fees
						may apply.
					</p>
				{/if}
			</svelte:fragment>
		</Tooltip>
	{:else if !missingFees}
		{formatter(net)}
	{:else}
		{formatter(gross)}*
	{/if}
{/snippet}

{#snippet returnColumnCell(vault: VaultInfo, column: ReturnColumnDefinition)}
	{@const values = getReturnColumnValues(vault, column.id)}
	{@const limitedData = getReturnDataCoverage(vault, column.id)}
	{@const lifetimeData = getReturnLifetimeData(vault, column.id)}
	<td class={`${getReturnCellClass(column)} right net-gross`}>
		{@render netGrossCell(
			values.net,
			values.gross,
			formatReturn,
			column.showAnnualisedTooltip,
			limitedData,
			lifetimeData
		)}
	</td>
{/snippet}

{#snippet providerRiskRatingCell(vault: VaultInfo)}
	{#if ratingProvider === 'core3'}
		<!-- Reuse the protocol-list grade and tone treatment for consistency. -->
		<Core3RiskCell rating={getCore3PolForVault(vault, topVaults.core3_protocols)?.rating} slug={vault.protocol_slug} />
	{:else}
		<Tooltip>
			<span slot="trigger" class="risk-rating-value">{getXerberusRiskRating(vault)}</span>
			<svelte:fragment slot="popup">
				{#if vault.xerberus?.entity_type === 'pool'}
					<p>Xerberus scored this vault directly on a 0–100 scale. Higher scores indicate lower estimated risk.</p>
				{:else}
					<p>
						Xerberus scored this vault's underlying protocol on a 0–100 scale. Higher scores indicate lower estimated
						risk.
					</p>
				{/if}
			</svelte:fragment>
		</Tooltip>
	{/if}
{/snippet}

{#snippet tvlValues(vault: VaultInfo)}
	<div class="multiline multival">
		<span class="primary">{formatTvl(getVaultCurrentTvlUsd(vault))}</span>
		<span class="secondary">{formatTvl(getVaultPeakTvlUsd(vault))}</span>
	</div>
{/snippet}

{#snippet tvlBreakdown(label: string, nav: number | null, vault: VaultInfo)}
	<section class="tvl-breakdown-section">
		<h4>{label}</h4>
		<dl>
			<div>
				<dt>{vault.denomination}</dt>
				<dd>{formatTvlTokenAmount(nav, vault.denomination)}</dd>
			</div>
			<div>
				<dt>USD</dt>
				<dd>{formatTvl(nav == null ? null : getVaultCurrentTvlUsd({ ...vault, current_nav: nav }))}</dd>
			</div>
			<div>
				<dt>{getVaultDenominationCurrency(vault)?.toUpperCase() ?? 'Native currency'}</dt>
				<dd>{formatNativeTvl(vault, nav)}</dd>
			</div>
		</dl>
	</section>
{/snippet}

<div class="top-vaults-table">
	<div class="table-extras">
		<div class="table-stats" class:hidden={loading} data-testid="top-vaults-meta">
			<Tooltip>
				<svelte:fragment slot="trigger"
					>{matchingVaultCount} vaults{#if totalVaultCount > matchingVaultCount}
						<span>&nbsp;out of {totalVaultCount}</span>{/if}</svelte:fragment
				>
				<svelte:fragment slot="popup"
					>{#if hiddenByTvl > 0}
						{hiddenByTvl} vault{hiddenByTvl === 1 ? ' is' : 's are'} hidden because {hiddenByTvl === 1
							? 'it does'
							: 'they do'}
						not meet the minimum TVL threshold:
						{hiddenVaultNames.join(', ')}{#if hiddenByTvl > 2}, and {hiddenByTvl - 2} more{/if}.
					{:else}
						The number of vaults listed on this page.
					{/if}</svelte:fragment
				>
			</Tooltip>
			<Tooltip>
				<svelte:fragment slot="trigger">TVL {formatDollar(totalTvl, 0)}</svelte:fragment>
				<svelte:fragment slot="popup">This is the sum of TVL in all listed vaults on this page.</svelte:fragment>
			</Tooltip>
			<Tooltip>
				<svelte:fragment slot="trigger">Avg. return {formatPercent(avgTvlWeightedApy1M, 2)}</svelte:fragment>
				<svelte:fragment slot="popup"
					>This is a TVL-weighted average annualised return for 30 days period for all vaults on this list. Net returns
					is used when known for the vault protocol, otherwise we assume the reported returns are fee-inclusive.</svelte:fragment
				>
			</Tooltip>
			{#if !showFilters}
				<Tooltip>
					<svelte:fragment slot="trigger">{tvlTriggerLabel ?? `Min ${formatDollar(tvlThreshold, 0)}`}</svelte:fragment>
					<svelte:fragment slot="popup"
						>{tvlTooltip ??
							`The listing is limited to vaults with a minimum of ${formatDollar(tvlThreshold, 0)} TVL deposited currently.`}</svelte:fragment
					>
				</Tooltip>
			{/if}
			<Tooltip>
				<svelte:fragment slot="trigger">Stablecoin-only</svelte:fragment>
				<svelte:fragment slot="popup"
					>We list stablecoin-denominated vaults only. This excludes vaults with cryptocurrency denominator like ETH or
					BTC.</svelte:fragment
				>
			</Tooltip>
			<span
				><Tooltip>
					<svelte:fragment slot="trigger">Updated <Timestamp date={topVaults.generated_at} relative /></svelte:fragment>
					<svelte:fragment slot="popup">Metrics are updated daily.</svelte:fragment>
				</Tooltip></span
			>
		</div>

		{#if showFilters}
			<button
				class="mobile-filters-trigger"
				data-testid="mobile-filters-trigger"
				aria-expanded={filtersOpen}
				onclick={toggleFilters}
			>
				<IconChevronDown />
				<span>Filters</span>
			</button>

			<div class="table-filters" class:mobile-filters-open={filtersOpen}>
				<details class="vault-filters" data-testid="vault-filters" bind:open={filtersOpen}>
					<summary class="filters-summary" data-testid="filters-summary" onclick={toggleDesktopFilters}>
						<IconChevronDown />
						<span>Filters</span>
					</summary>

					<div class="filters-content">
						<div class="filters-groups">
							<section
								class="filter-section filter-section-display"
								data-testid="filter-group-display"
								role="group"
								aria-labelledby="filter-group-display-heading"
							>
								<h3 class="filter-section-heading" id="filter-group-display-heading">Display</h3>
								<div class="filter-group">
									<span class="filter-label">Columns</span>
									<div class="tvl-dropdown" use:clickOutside={() => (returnsDropdownOpen = false)}>
										<button
											class="tvl-trigger"
											data-testid="return-columns-trigger"
											onclick={() => (returnsDropdownOpen = !returnsDropdownOpen)}
										>
											{selectedReturnsLabel}
											<IconChevronDown />
										</button>
										{#if returnsDropdownOpen}
											<ul class="tvl-options returns-options" data-testid="return-columns-menu">
												{#each returnColumnDefinitions as definition (definition.id)}
													<li>
														<label class:selected={selectedReturnColumnIds.includes(definition.id)}>
															<input
																type="checkbox"
																checked={selectedReturnColumnIds.includes(definition.id)}
																onchange={() => onReturnColumnToggle(definition.id)}
															/>
															<span>{definition.label}</span>
														</label>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>
							</section>

							<section
								class="filter-section filter-section-hide"
								data-testid="filter-group-hide"
								role="group"
								aria-labelledby="filter-group-hide-heading"
							>
								<h3 class="filter-section-heading" id="filter-group-hide-heading">Hide vaults</h3>
								<div class="filter-group">
									<Tooltip>
										<label class="checkbox-filter" slot="trigger">
											<input
												type="checkbox"
												checked={hideClosed}
												onchange={() => updateSearchParams({ closed: hideClosed ? 0 : 1 })}
											/>
											<span class="filter-label filter-label-hint">Currently closed</span>
										</label>
										<svelte:fragment slot="popup">
											Don't show vaults that are not accepting new deposits currently
										</svelte:fragment>
									</Tooltip>
								</div>

								{#if showUnknownFilter}
									<div class="filter-group">
										<Tooltip>
											<label class="checkbox-filter" slot="trigger">
												<input
													type="checkbox"
													checked={hideUnknown}
													onchange={() => updateSearchParams({ unknown: hideUnknown ? 0 : 1 })}
												/>
												<span class="filter-label filter-label-hint">Unknown protocols</span>
											</label>
											<svelte:fragment slot="popup">
												Don't show vaults whose protocol has not been identified yet
											</svelte:fragment>
										</Tooltip>
									</div>
								{/if}

								<div class="filter-group">
									<Tooltip>
										<label class="checkbox-filter" slot="trigger">
											<input
												type="checkbox"
												checked={hideAmm}
												onchange={() => updateSearchParams({ amm: hideAmm ? 0 : 1 })}
											/>
											<span class="filter-label filter-label-hint">AMM</span>
										</label>
										<svelte:fragment slot="popup">
											<p>Hide AMM pools and AMM-like vaults with direct exposure to underlying assets.</p>
											<a href={resolve('/glossary/amm')}>What is AMM?</a>
										</svelte:fragment>
									</Tooltip>
								</div>

								{#if showPrivateFilter}
									<div class="filter-group">
										<Tooltip>
											<label class="checkbox-filter" slot="trigger">
												<input
													type="checkbox"
													checked={hidePrivate}
													onchange={() => updateSearchParams({ private: hidePrivate ? 0 : 1 })}
												/>
												<span class="filter-label filter-label-hint">Private</span>
											</label>
											<svelte:fragment slot="popup">Hide vaults that require permission to deposit</svelte:fragment>
										</Tooltip>
									</div>
								{/if}
							</section>

							<section
								class="filter-section filter-section-performance"
								data-testid="filter-group-performance"
								role="group"
								aria-labelledby="filter-group-performance-heading"
							>
								<h3 class="filter-section-heading" id="filter-group-performance-heading">Performance and risk</h3>
								<div class="filter-group">
									<Tooltip>
										<span class="filter-label filter-label-hint" slot="trigger">Technical risk</span>
										<svelte:fragment slot="popup">
											The technical risk accounts for the software development best practices followed by the underlying
											vault protocol, and is a proxy e.g. for cyber security incidents. The vault technical risk
											framework is still in beta and we are expecting changes.
											<a href={resolve('/blog/announcing-vault-technical-risk-framework-beta')} target="_blank"
												>Read this blog post for more information.</a
											>
										</svelte:fragment>
									</Tooltip>
									<div class="tvl-dropdown" use:clickOutside={() => (riskDropdownOpen = false)}>
										<button class="tvl-trigger" onclick={() => (riskDropdownOpen = !riskDropdownOpen)}>
											{selectedRisk.label}
											<IconChevronDown />
										</button>
										{#if riskDropdownOpen}
											<ul class="tvl-options">
												{#each riskFilterOptions as option, i (option.label)}
													<li>
														<button
															class:active={selectedRiskIndex === i}
															onclick={() => {
																updateSearchParams({ risk: i });
																riskDropdownOpen = false;
															}}
														>
															{option.optionLabel}
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>

								<div class="filter-group">
									<span class="filter-label">Min TVL</span>
									<div class="tvl-dropdown" use:clickOutside={() => (tvlDropdownOpen = false)}>
										<button class="tvl-trigger" onclick={() => (tvlDropdownOpen = !tvlDropdownOpen)}>
											{selectedTvlOption.label}
											<IconChevronDown />
										</button>
										{#if tvlDropdownOpen}
											<ul class="tvl-options">
												{#each tvlFilterOptions as option (option.key)}
													<li>
														<button
															class:active={selectedTvlKey === option.key}
															onclick={() => {
																updateSearchParams({ tvl: option.key });
																tvlDropdownOpen = false;
															}}
														>
															{option.optionLabel}
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>

								<div class="filter-group">
									<span class="filter-label">Age</span>
									<Select
										value={selectedAgeIndex}
										onchange={(e: Event) => updateSearchParams({ age: Number((e.target as HTMLSelectElement).value) })}
									>
										{#each ageFilterOptions as option, i (option.label)}
											<option value={i}>{option.label}</option>
										{/each}
									</Select>
								</div>

								<div class="filter-group">
									<Tooltip>
										<span class="filter-label filter-label-hint" slot="trigger">Max drawdown</span>
										<svelte:fragment slot="popup">
											Filter vaults by lifetime maximum drawdown.
											<a href={resolve('/glossary/maximum-drawdown')} target="_blank"
												>Learn more about maximum drawdown.</a
											>
										</svelte:fragment>
									</Tooltip>
									<div class="tvl-dropdown" use:clickOutside={() => (ddDropdownOpen = false)}>
										<button class="tvl-trigger" onclick={() => (ddDropdownOpen = !ddDropdownOpen)}>
											{selectedDdOption.label}
											<IconChevronDown />
										</button>
										{#if ddDropdownOpen}
											<ul class="tvl-options">
												{#each ddFilterOptions as option (option.key)}
													<li>
														<button
															class:active={selectedDdKey === option.key}
															onclick={() => {
																updateSearchParams({ dd: option.key });
																ddDropdownOpen = false;
															}}
														>
															{option.optionLabel}
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>

								<div class="filter-group">
									<Tooltip>
										<span class="filter-label filter-label-hint" slot="trigger">Monthly returns</span>
										<svelte:fragment slot="popup">
											Filter vaults by annualised one-month return (net of fees when available).
										</svelte:fragment>
									</Tooltip>
									<div class="tvl-dropdown" use:clickOutside={() => (mrDropdownOpen = false)}>
										<button class="tvl-trigger" onclick={() => (mrDropdownOpen = !mrDropdownOpen)}>
											{selectedMrOption.label}
											<IconChevronDown />
										</button>
										{#if mrDropdownOpen}
											<ul class="tvl-options">
												{#each monthlyReturnFilterOptions as option (option.key)}
													<li>
														<button
															class:active={selectedMrKey === option.key}
															disabled={option.mode === 'gt-treasury' && treasuryRate == null}
															onclick={() => {
																updateSearchParams({ mr: option.key });
																mrDropdownOpen = false;
															}}
														>
															{option.optionLabel}{option.mode === 'gt-treasury' && treasuryRate != null
																? ` (${formatPercent(treasuryRate / 100, 2)})`
																: ''}
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>

								<div class="filter-group">
									<Tooltip>
										<span class="filter-label filter-label-hint" slot="trigger">Volatility</span>
										<svelte:fragment slot="popup">
											Filter vaults by three-month annualised volatility.
											<a href={resolve('/glossary/volatility')} target="_blank">Learn more about volatility.</a>
										</svelte:fragment>
									</Tooltip>
									<div class="tvl-dropdown" use:clickOutside={() => (volatilityDropdownOpen = false)}>
										<button class="tvl-trigger" onclick={() => (volatilityDropdownOpen = !volatilityDropdownOpen)}>
											{selectedVolatilityOption.label}
											<IconChevronDown />
										</button>
										{#if volatilityDropdownOpen}
											<ul class="tvl-options">
												{#each volatilityFilterOptions as option (option.key)}
													<li>
														<button
															class:active={selectedVolatilityKey === option.key}
															onclick={() => {
																updateSearchParams({ vol: option.key });
																volatilityDropdownOpen = false;
															}}
														>
															{option.optionLabel}
														</button>
													</li>
												{/each}
											</ul>
										{/if}
									</div>
								</div>
							</section>
						</div>

						{#if showAllVaultsFilterNote}
							<p class="filters-note" data-testid="filters-note">
								The vaults on the listing are limited to the current category. <a href={allVaultsPath}
									>See all vaults.</a
								>
							</p>
						{/if}
					</div>
				</details>
			</div>
		{/if}
	</div>

	<div class="table-wrapper">
		<!-- --table-width needed for proper tr.targetable styling  -->
		<table
			bind:offsetWidth
			style:--table-width="{offsetWidth}px"
			class:loading
			class:with-rating={showProviderRiskRating}
		>
			<thead>
				<tr>
					<th class="index"></th>
					{#if showChainCol}
						{@render sortColHeader('', 'chain', 'asc')}
					{/if}
					{@render sortColHeader('Vault', 'vault', 'asc')}
					{#if showProviderRiskRating}
						{@render sortColHeader('Risk', 'provider_risk_rating', ratingProvider === 'xerberus' ? 'desc' : 'asc')}
					{/if}
					{#each selectedReturnColumns as column (column.id)}
						{@render sortColHeader(column.headerLabel, column.id, column.sortDirection)}
					{/each}
					{@render sortColHeader('3m Sharpe', 'three_months_sharpe', 'desc')}
					{@render sortColHeader('3M Vola&shy;tility', 'three_months_volatility', 'asc')}
					{@render sortColHeader('Max DD', 'max_dd', 'desc')}
					{@render sortColHeader('Denom&shy;ination', 'denomination', 'asc')}
					{@render sortColHeader('TVL USD<br/>(current/&ZeroWidthSpace;peak)', 'tvl', 'desc')}
					{@render sortColHeader('Age (y)', 'age', 'desc')}
					{@render sortColHeader('Fees<br />(mgmt/&ZeroWidthSpace;perf)', 'fees', 'asc')}
					{@render sortColHeader('Deposit and delays', 'lockup', 'asc')}
					{#if showTechnicalRisk}
						{@render sortColHeader('Protocol Technical Risk', 'risk', 'asc')}
					{/if}
					<th class="sparkline">3M price</th>
				</tr>
			</thead>
			<tbody>
				{#if loading}
					{#each skeletonRows as index (index)}
						<tr>
							<td class="index"></td>
							{#if showChainCol}<td class="chain"></td>{/if}
							<td class="vault"></td>
							{#if showProviderRiskRating}<td class="risk-rating right"></td>{/if}
							{#each selectedReturnColumns as column (column.id)}
								<td class={`${getReturnCellClass(column)} right`}></td>
							{/each}
							<td class="three_months_sharpe right"></td>
							<td class="three_months_volatility right"></td>
							<td class="max_dd right"></td>
							<td class="denomination center"></td>
							<td class="tvl right"></td>
							<td class="age right"></td>
							<td class="fees right"></td>
							<td class="lockup"></td>
							{#if showTechnicalRisk}<td class="risk"></td>{/if}
							<td class="sparkline"></td>
						</tr>
					{/each}
				{/if}
				{#each visibleVaults as vault (vault.id)}
					{@const chain = getChain(vault.chain_id)}
					{@const blacklisted = isBlacklisted(vault)}
					{@const badStatus = !isGoodVaultStatus(vault)}
					{@const isPrivate = isPermissionedVault(vault)}
					{@const isTokenisedFund = vault.flags.includes('tokenised_fund')}
					{@const isCapped = isVaultDepositCapped(vault)}
					{@const depositStatusLabel = isTokenisedFund ? 'Fund' : 'Private'}
					{@const protocolName = getVaultProtocolDisplayName(vault)}
					{@const curatorLogos = vault.curator_slug ? topVaults.curators[vault.curator_slug]?.logos : undefined}
					{@const curatorLogoUrl = curatorLogos?.generic ?? curatorLogos?.light ?? curatorLogos?.dark}
					{@const vaultLogoUrl = curatorLogoUrl ?? getVaultProtocolLogoUrl(vault.protocol_slug)}
					{@const statusReason = [vault.deposit_closed_reason, vault.redemption_closed_reason]
						.filter(Boolean)
						.join('; ')}
					<tr class={['targetable', blacklisted && !disableBlacklistedStrikethrough && 'blacklisted']}>
						<!-- index cell is populated with row index via `rowNumber` CSS counter -->
						<td class="index"></td>
						{#if showChainCol}
							<td class="chain">
								<ChainCell {chain} label={getChainDisplayName(vault.chain_id)} />
							</td>
						{/if}
						<td class="vault">
							<div class="vault-identity">
								{#if !showChainCol && vaultLogoUrl}
									<img class="vault-logo" src={vaultLogoUrl} alt="" />
								{/if}
								<div class="multiline">
									<strong>{vault.name}</strong>
									{#if protocolName}
										<span class="secondary">{protocolName}</span>
									{/if}
								</div>
							</div>
						</td>
						{#if showProviderRiskRating}
							<td class="risk-rating right">{@render providerRiskRatingCell(vault)}</td>
						{/if}
						{#each selectedReturnColumns as column (column.id)}
							{@render returnColumnCell(vault, column)}
						{/each}
						<td class="three_months_sharpe right">
							{formatNumber(vault.three_months_sharpe, 1)}
						</td>
						<td class="three_months_volatility right">
							{formatVolatility(vault.three_months_volatility)}
						</td>
						<td class="max_dd right">
							{getLifetimeMaxDrawdown(vault) != null ? formatPercent(getLifetimeMaxDrawdown(vault)) : notFilledMarker}
						</td>
						<td class="denomination center">
							{formatValue(vault.denomination)}
						</td>
						<td class="tvl right">
							{#if shouldShowTvlBreakdown(vault)}
								<Tooltip>
									<svelte:fragment slot="trigger">
										<div class="tvl-tooltip-trigger">
											{@render tvlValues(vault)}
										</div>
									</svelte:fragment>
									<svelte:fragment slot="popup">
										<div class="tvl-breakdown">
											{@render tvlBreakdown('Current TVL', vault.current_nav, vault)}
											{@render tvlBreakdown('Peak TVL', vault.peak_nav, vault)}
											<p class="exchange-rate">Exchange rate: {formatVaultExchangeRate(vault)}</p>
										</div>
									</svelte:fragment>
								</Tooltip>
							{:else}
								{@render tvlValues(vault)}
							{/if}
						</td>
						<td class="age right">
							{formatNumber(vault.years, 1)}
						</td>
						<td class="fees right">
							<FeesCell mgmt_fee={vault.mgmt_fee} perf_fee={vault.perf_fee} />
						</td>
						<td class={['lockup', vault.lockup === null && 'unknown', isPrivate && 'private']}>
							{#if isCapped}
								<Tooltip>
									<svelte:fragment slot="trigger">
										<span class="status-wrapper">
											<IconStop />Capped
										</span>
									</svelte:fragment>
									<svelte:fragment slot="popup"
										>This vault has reached its deposit cap. {getLockupDescription(vault)}</svelte:fragment
									>
								</Tooltip>
							{:else if isPrivate}
								<Tooltip>
									<svelte:fragment slot="trigger">
										<span class="status-wrapper">
											<IconStop />{depositStatusLabel}
										</span>
									</svelte:fragment>
									<svelte:fragment slot="popup">
										This vault does not accept public deposits.
										{#if badStatus}
											The vault deposit or redemption may be currently closed: {statusReason}. {getLockupDescription(
												vault
											)}
										{:else}
											{getLockupDescription(vault)}
										{/if}
									</svelte:fragment>
								</Tooltip>
							{:else if badStatus}
								<Tooltip>
									<svelte:fragment slot="trigger">
										<span class="status-wrapper">
											{#if vault.deposit_closed_reason != null}<IconHourglass />{/if}{getFormattedLockup(vault)}
										</span>
									</svelte:fragment>
									<svelte:fragment slot="popup"
										>The vault deposit or redemption may be currently closed: {statusReason}. {getLockupDescription(
											vault
										)}</svelte:fragment
									>
								</Tooltip>
							{:else}
								<Tooltip>
									<svelte:fragment slot="trigger">
										<span class="status-wrapper">
											{#if vault.deposit_closed_reason != null}<IconHourglass />{/if}{getFormattedLockup(vault)}
										</span>
									</svelte:fragment>
									<svelte:fragment slot="popup">{getLockupTooltip(vault)}</svelte:fragment>
								</Tooltip>
							{/if}
						</td>
						{#if showTechnicalRisk}
							<td class="risk">
								<RiskCell risk={vault.risk} />
							</td>
						{/if}
						<td class="sparkline">
							<VaultSparkline {vault} />
							<TargetableLink label="View {vault.name} details" href={resolveVaultDetails(vault)} class="row-link" />
						</td>
					</tr>
				{/each}
				{#if hasMoreRows}
					<tr class="load-more-sentinel" data-testid="load-more-sentinel">
						<td colspan={12 + selectedReturnColumns.length + (showChainCol ? 1 : 0) + (showProviderRiskRating ? 1 : 0)}>
							<div use:inview={{ rootMargin: '300px' }} oninview_enter={loadMore}>
								<Spinner size="18" /> Loading more vaults... ({visibleVaults.length}{#if !progressive}
									of {sortedVaults.length}{/if})
							</div>
						</td>
					</tr>
				{/if}
			</tbody>
		</table>
	</div>

	{#if hiddenBlacklistedCount > 0 && !remoteHasMore}
		<button
			class="show-blacklisted-vaults"
			data-testid="show-blacklisted-vaults"
			disabled={remoteLoading}
			type="button"
			onclick={showBlacklistedVaults}
		>
			Show {hiddenBlacklistedCount} blacklisted {hiddenBlacklistedCount === 1 ? 'vault' : 'vaults'}
		</button>
	{/if}
</div>

<style>
	.top-vaults-table {
		display: grid;
		gap: 1rem;

		.table-extras {
			display: flex;
			flex-wrap: wrap;
			justify-content: space-between;

			gap: 1rem 1.5rem;
			align-items: center;
			margin-top: 1rem;
			--text-input-width: 100%;

			@media (--viewport-md-down) {
				grid-template-columns: 1fr;
			}
		}

		.table-stats {
			display: flex;
			flex-wrap: wrap;
			flex-grow: 1;
			gap: 0.25rem 0;
			color: var(--c-text-extra-light);
			font: var(--f-ui-md-medium);

			> :global(*):not(:last-child)::after {
				content: '|';
				margin-left: 0.1rem;
				margin-right: 0.3rem;
				opacity: 0.5;
			}
		}

		.table-filters {
			display: grid;
			gap: 0.75rem 1.5rem;
			width: 100%;
			font: var(--f-ui-sm-medium);
		}

		.mobile-filters-trigger {
			display: none;
		}

		.filters-groups {
			display: grid;
			gap: 1rem;
		}

		.filter-section {
			display: flex;
			flex-wrap: wrap;
			align-content: start;
			gap: 0.75rem 1.5rem;
			min-width: 0;
		}

		.filter-section-heading {
			width: 100%;
			margin: 0;
			font: var(--f-ui-sm-bold);
			font-size: 1rem;
			letter-spacing: 0.06em;
			text-transform: uppercase;
			color: var(--c-text-light);

			@media (--viewport-sm-down) {
				font-size: 0.875rem;
			}
		}

		.filter-section-hide {
			flex-direction: column;
			flex-wrap: nowrap;
			align-items: flex-start;
		}

		.filter-group {
			display: flex;
			align-items: center;
			gap: 0.375rem;
		}

		.filter-label {
			color: var(--c-text-extra-light);
			white-space: nowrap;
		}

		.filter-label-hint {
			text-decoration: underline;
			text-decoration-style: dashed;
			text-underline-offset: 0.2em;
			cursor: help;
		}

		.checkbox-filter {
			display: flex;
			align-items: center;
			gap: 0.375rem;
			cursor: pointer;

			input[type='checkbox'] {
				width: 1.125rem;
				height: 1.125rem;
				cursor: pointer;
			}
		}

		.tvl-dropdown {
			position: relative;
		}

		.tvl-trigger {
			display: inline-flex;
			align-items: center;
			gap: 0.25rem;
			padding: var(--space-sl);
			padding-right: calc(var(--space-sl) + var(--space-lg));
			border: 1px var(--c-input-border) solid;
			border-radius: var(--radius-sm);
			background: var(--c-input-background);
			color: inherit;
			font: inherit;
			cursor: pointer;
			position: relative;

			&:hover,
			&:focus-within {
				background: var(--c-input-background-focus);
			}

			:global(.icon) {
				position: absolute;
				right: var(--space-sl);
				--icon-size: 0.875em;
				pointer-events: none;
			}
		}

		.tvl-options {
			position: absolute;
			top: 100%;
			left: 0;
			z-index: 10;
			margin-top: 0.25rem;
			padding: 0.25rem 0;
			min-width: 100%;
			width: max-content;
			border: 1px var(--c-input-border) solid;
			border-radius: var(--radius-sm);
			background: var(--c-body);
			box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
			list-style: none;

			li button {
				display: block;
				width: 100%;
				padding: 0.5rem 0.75rem;
				border: none;
				background: transparent;
				color: inherit;
				font: inherit;
				text-align: left;
				white-space: nowrap;
				cursor: pointer;

				&:hover {
					background: var(--c-box-2);
				}

				&.active {
					background: var(--c-box-3);
					font-weight: 600;
				}
			}
		}

		.returns-options {
			padding: 0.25rem 0;
			min-width: 14rem;

			li label {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				width: 100%;
				padding: 0.5rem 0.75rem;
				cursor: pointer;

				&:hover {
					background: var(--c-box-2);
				}

				&.selected {
					background: var(--c-box-3);
					font-weight: 600;
				}
			}

			input[type='checkbox'] {
				width: 1rem;
				height: 1rem;
				margin: 0;
				cursor: pointer;
			}
		}

		.filter-group :global(.select) {
			font: inherit;
		}

		@media (--viewport-md-up) {
			.filters-groups {
				column-gap: 0;
				grid-template-columns: minmax(16rem, 0.8fr) minmax(12.5rem, 0.55fr) minmax(0, 1.5fr);
			}

			.filter-section-display {
				padding-right: 1.5rem;
			}

			.filter-section-hide {
				border-left: 1px solid var(--c-input-border);
				padding-inline: 1.5rem;
			}

			.filter-section-performance {
				display: grid;
				align-items: center;
				gap: 0.75rem 0.5rem;
				border-left: 1px solid var(--c-input-border);
				padding-left: 1.5rem;

				.filter-section-heading {
					grid-column: 1 / -1;
				}

				.filter-group {
					display: contents;

					> .filter-label,
					> :global(.tooltip) {
						width: 100%;
						text-align: right;
					}

					> :last-child {
						justify-self: start;
						max-width: 100%;
					}

					> :global(.select) {
						min-width: 0;
						width: 100%;
					}
				}
			}
		}

		@media (--viewport-md-up) and (--viewport-lg-down) {
			.filter-section-performance {
				grid-template-columns: max-content minmax(0, 1fr);
			}
		}

		@media (--viewport-xl-up) {
			.filter-section-performance {
				grid-template-columns: repeat(2, max-content max-content) max-content minmax(8rem, 1fr);
				column-gap: 0.75rem;
			}
		}

		.vault-filters {
			width: 100%;
			border: 1px solid var(--c-input-border);
			border-radius: var(--radius-sm);
			background: color-mix(in srgb, var(--c-input-background), transparent 15%);
		}

		.filters-summary {
			display: flex;
			align-items: center;
			gap: 0.5rem;
			padding: var(--space-sl) var(--space-md);
			cursor: pointer;
			list-style: none;
			font: inherit;
			color: var(--c-text-extra-light);

			&::-webkit-details-marker {
				display: none;
			}

			:global(.icon) {
				flex-shrink: 0;
				--icon-size: 0.875em;
				transition: transform var(--time-sm) ease-out;
			}
		}

		.vault-filters[open] .filters-summary {
			border-bottom: 1px solid var(--c-input-border);

			:global(.icon) {
				transform: rotate(180deg);
			}
		}

		.filters-content {
			display: grid;
			gap: 0.75rem 1.5rem;
			padding: var(--space-md);
		}

		.filters-note {
			width: 100%;
			margin: 0;
			color: var(--c-text-ultra-light);
			font: var(--f-ui-xs-medium);
			line-height: 1.4;

			a {
				color: inherit;
				text-decoration: underline;
				text-underline-offset: 0.15em;
			}
		}

		@media (--viewport-sm-down) {
			.mobile-filters-trigger {
				display: flex;
				align-items: center;
				gap: 0.5rem;
				width: 100%;
				padding: var(--space-sl) var(--space-md);
				border: 1px solid var(--c-input-border);
				border-radius: var(--radius-sm);
				background: color-mix(in srgb, var(--c-input-background), transparent 15%);
				color: var(--c-text-extra-light);
				font: var(--f-ui-sm-medium);
				text-align: left;
				cursor: pointer;

				:global(.icon) {
					--icon-size: 0.875em;
					transition: transform var(--time-sm) ease-out;
				}

				&[aria-expanded='true'] :global(.icon) {
					transform: rotate(180deg);
				}
			}

			.table-filters {
				display: none;

				&.mobile-filters-open {
					display: grid;
					padding: var(--space-md);
					border: 1px solid var(--c-input-border);
					border-radius: var(--radius-sm);
					background: color-mix(in srgb, var(--c-input-background), transparent 15%);
				}
			}

			.vault-filters {
				border: 0;
				border-radius: 0;
				background: transparent;
			}

			.filters-summary {
				display: none;
			}

			.filters-content {
				padding: 0;
			}
		}

		.table-wrapper {
			width: 100%;

			/*
				Setting overflow:auto breaks the sticky header, but is needed to allow horizontal scrolling
				on smaller viewports. Best compromise is to only set overflow on smaller viewports.
			 */
			@media (--viewport-xl-down) {
				overflow-x: auto;
			}
		}

		.show-blacklisted-vaults {
			justify-self: center;
			padding: 0;
			border: 0;
			background: transparent;
			color: var(--c-text-extra-light);
			font: var(--f-ui-sm-medium);
			text-decoration: underline;
			text-underline-offset: 0.15em;
			cursor: pointer;
		}

		table {
			position: relative;
			table-layout: fixed;
			border-collapse: collapse;
			width: 86rem;
			color: inherit;
			font: var(--f-mono-xs-regular);
			line-height: 1;
			letter-spacing: var(--f-text-md-spacing, normal);
			counter-reset: rowNumber;

			@media (--viewport-sm-down) {
				width: 58rem;
				min-width: 58rem;
				font-size: 11px;
				line-height: 1.25;

				th {
					--th-padding: 0.375rem 0.25rem calc(0.375rem + 2px) 0.25rem;

					button {
						min-height: 2.5rem;
					}
				}
			}

			&.with-rating {
				width: 92rem;

				@media (--viewport-sm-down) {
					width: 65.5rem;
					min-width: 65.5rem;
				}
			}

			:is(td, th) {
				vertical-align: top;
			}

			th {
				position: sticky;
				top: 0px;
				z-index: 1;
				/* sticky header background must be solid (no transparency) */
				background: color-mix(in srgb, var(--c-body), hsl(var(--hsl-box)) var(--box-4-alpha));
				/* sticky header border gets lost on scroll, so use box-shadow instead */
				box-shadow: inset 0px -2px var(--c-text-extra-light);
				/* add extra padding to bottom to account for the inset box-shadow */
				--th-padding: 0.5rem 0.5rem calc(0.5rem + 2px) 0.5rem;
				font-weight: 900;
				text-transform: uppercase;
				text-align: left;

				&:not(:has(button)) {
					padding: var(--th-padding);
				}

				button {
					display: flex;
					border: none;
					width: 100%;
					min-height: 3rem;
					padding: var(--th-padding);
					background: transparent;
					font: inherit;
					text-align: inherit;
					text-transform: inherit;
					cursor: pointer;
				}

				:global(.icon) {
					position: absolute;
					top: 0.625rem;
					right: 0.125rem;
					left: var(--icon-left, auto);
					min-width: 1em;
					--icon-size: 0.875em;

					:global(*) {
						stroke-width: 3;
					}
				}
			}

			td {
				border-block: 1px solid var(--c-text-ultra-light);
				padding: 0.25em 0.5em;

				@media (--viewport-sm-down) {
					padding: 0.125em 0.25em;
				}

				--c-col-a: var(--c-box-3);
				--c-col-b: var(--c-box-1);

				/* alternating column colors */
				&:nth-child(even) {
					background-color: var(--c-col-a);
				}

				&:nth-child(odd) {
					background-color: var(--c-col-b);
				}

				&.right {
					text-align: right;
				}

				&.center {
					text-align: center;
				}
			}

			/* reverse column colors if chain col is present */
			:where(tr:has(.chain)) td {
				&:nth-child(odd) {
					background-color: var(--c-col-a);
				}

				&:nth-child(even) {
					background-color: var(--c-col-b);
				}
			}

			tr.blacklisted td {
				text-decoration: line-through;
			}

			:is(td, th):global(:has(.tooltip)) {
				position: relative;
			}

			:global(.multiline) {
				display: grid;
				gap: 0.5rem;

				@media (--viewport-sm-down) {
					gap: 0.125rem;
					min-width: 0;
				}
			}

			:global(.multiline > *) {
				@media (--viewport-sm-down) {
					min-width: 0;
					overflow-wrap: anywhere;
				}
			}

			:global(.secondary) {
				opacity: 0.7;
			}

			.multival {
				> ::before {
					content: '(';
				}

				> ::after {
					content: ')';
				}

				.primary {
					font-weight: 600;

					&::before,
					&::after {
						visibility: hidden;
					}
				}
			}

			/**
			 * Column-specific widths and style overrides
			 */
			.index {
				width: 2.25rem;

				@media (--viewport-sm-down) {
					width: 1.5rem;

					&:is(td) {
						padding-inline: 0;
					}
				}

				/* no background on index column header */
				&:is(th) {
					background: var(--c-body);
				}

				&:is(td) {
					text-align: center;
					vertical-align: middle;
					background-color: var(--c-col-b);
					counter-increment: rowNumber;

					&::before {
						content: counter(rowNumber);
					}
				}
			}

			.chain {
				width: 1.875rem;
				--icon-left: calc(50% - 1ex);

				&:is(td) {
					vertical-align: middle;
					/* override background color to match vault column */
					background-color: var(--c-col-a);
				}
			}

			.vault {
				width: 20.5%;
				--icon-left: 8ch;

				@media (--viewport-sm-down) {
					width: 10rem;
					max-width: 10rem;
				}

				.vault-identity {
					display: flex;
					align-items: center;
					gap: 0.5rem;
				}

				.vault-logo {
					width: 1.5rem;
					height: 1.5rem;
					flex: none;
					object-fit: contain;
				}
			}

			/* Apply the fixed width to both the cells and its sortable header. */
			:is(.risk-rating, .provider_risk_rating) {
				width: 4.5rem;
				min-width: 4.5rem;
			}

			.risk-rating {
				/* The tooltip trigger only appears in body cells. */
				.risk-rating-value {
					white-space: nowrap;
					text-decoration: underline;
					text-decoration-style: dashed;
					text-underline-offset: 0.2em;
					cursor: help;
				}

				:global(.popup) {
					right: 0;
					width: min(20rem, 80vw);
				}
			}

			.return-column {
				width: 6.5%;

				@media (--viewport-sm-down) {
					width: 7%;

					&:is(th) {
						font-size: 10px;
					}
				}
			}

			:is(.three_months_sharpe, .three_months_volatility) {
				width: 4.5%;

				@media (--viewport-sm-down) {
					width: 5.5%;
				}
			}

			.max_dd {
				width: 4.5%;

				@media (--viewport-sm-down) {
					width: 5%;
				}
			}

			.denomination {
				width: 5%;

				@media (--viewport-sm-down) {
					width: 7%;
					overflow-wrap: anywhere;
				}
			}

			.tvl {
				width: 6.25%;

				@media (--viewport-sm-down) {
					width: 8%;

					.multival {
						white-space: nowrap;
					}
				}

				.tvl-tooltip-trigger {
					display: inline-grid;
					justify-items: end;
					cursor: help;
				}

				:global(.popup) {
					right: 0;
					width: min(90vw, 28rem);
				}

				.tvl-breakdown {
					display: grid;
					gap: 0.85rem;
					min-width: min(22rem, 80vw);
				}

				.tvl-breakdown-section {
					display: grid;
					gap: 0.35rem;

					h4 {
						margin: 0;
						font: var(--f-ui-sm-bold);
					}

					dl {
						display: grid;
						gap: 0.25rem;
						margin: 0;
					}

					div {
						display: grid;
						grid-template-columns: minmax(7rem, 1fr) auto;
						gap: 1rem;
					}

					dt {
						color: var(--c-text-light);
					}

					dd {
						margin: 0;
						text-align: right;
						font-weight: 600;
					}
				}

				.exchange-rate {
					margin: 0;
					padding-top: 0.5rem;
					border-top: 1px solid var(--c-text-ultra-light);
				}
			}

			.age {
				width: 3.5%;
			}

			.fees {
				width: 4.5%;

				@media (--viewport-sm-down) {
					width: 5.5%;
				}
			}

			.lockup {
				width: 7.5%;

				@media (--viewport-sm-down) {
					width: 8%;
				}

				:global(.popup) {
					right: 0;
					width: 360px;
				}

				&.unknown {
					color: var(--c-text-light);
				}

				&:has(:global(.icon)) {
					color: var(--c-warning);
				}

				&.private {
					color: var(--c-bearish);
				}

				.status-wrapper {
					display: inline-flex;
					align-items: center;
					gap: 0.25rem;
					white-space: nowrap;
					--icon-size: 0.875rem;
				}
			}

			.risk {
				width: 5.5%;

				@media (--viewport-sm-down) {
					width: 8%;
				}

				:global(.popup) {
					right: 0;
					white-space: nowrap;
				}
			}

			td:is(.lockup, .risk) {
				font: var(--f-ui-xs-medium);
				letter-spacing: 0.02em;
			}

			.sparkline {
				width: 9%;

				@media (--viewport-sm-down) {
					width: 4.5rem;
					padding-inline: 0.125rem;

					:global(.vault-sparkline) {
						--sparkline-width: 4rem;
					}
				}

				&:is(td) {
					text-align: center;
					vertical-align: middle;
				}
			}

			.net-gross :global(.popup) {
				width: 17rem;
			}

			:global(.row-link):hover {
				background: var(--c-box-2);
			}

			.load-more-sentinel td {
				text-align: center;
				padding: 1.5rem;
				color: var(--c-text-light);
				font: var(--f-ui-sm-medium);
			}

			&.loading tbody tr td {
				position: relative;
				color: transparent;
				height: 2rem;

				> * {
					opacity: 0;
				}

				&::before {
					content: '';
					position: absolute;
					inset: var(--space-sm);
					border-radius: var(--radius-sm);
					background: var(--c-box-3);
					animation: pulse-opacity 1s infinite ease-out;
				}
			}
		}
	}

	.hidden {
		visibility: hidden;
	}

	.capped-hint {
		text-decoration: underline;
		text-decoration-style: dashed;
		cursor: help;
	}
</style>

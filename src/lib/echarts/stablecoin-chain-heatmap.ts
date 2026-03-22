import { getChain } from '$lib/helpers/chain';
import { getLogoUrl } from '$lib/helpers/assets';
import {
	buildStablecoinMetadataLookup,
	formatStablecoinDisplayName,
	getStablecoinLogoUrl,
	resolveStablecoinSlug
} from '$lib/stablecoin-metadata/helpers';
import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
import { isBlacklisted } from '$lib/top-vaults/helpers';
import type { VaultInfo } from '$lib/top-vaults/schemas';

export const STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS = 2 * 60 * 60;
export const STABLECOIN_CHAIN_HEATMAP_OUTLIER_THRESHOLD = 50_000_000_000;
export const STABLECOIN_CHAIN_HEATMAP_TOP_N = 10;

export interface StablecoinChainHeatmapAxisEntry {
	key: string;
	label: string;
	totalTvl: number;
	href?: string;
	logoUrl?: string;
}

export interface StablecoinChainHeatmapChainEntry extends StablecoinChainHeatmapAxisEntry {
	chainIds: number[];
}

export interface StablecoinChainHeatmapStablecoinEntry extends StablecoinChainHeatmapAxisEntry {
	stablecoinSlug: string;
	tooltipLabel: string;
}

export interface StablecoinChainHeatmapCell {
	chainKey: string;
	stablecoinKey: string;
	tvl: number;
	vaultCount: number;
	apy: number | null;
	monthlyReturn: number | null;
}

export interface StablecoinChainHeatmapPayload {
	generatedAt: string;
	durationMs: number;
	cacheTtlSeconds: number;
	chains: StablecoinChainHeatmapChainEntry[];
	stablecoins: StablecoinChainHeatmapStablecoinEntry[];
	cells: StablecoinChainHeatmapCell[];
	meta: {
		includedVaults: number;
		excludedBlacklistedVaults: number;
		excludedOutlierVaults: number;
		nonZeroCells: number;
	};
}

interface ResolvedChainGroup {
	key: string;
	label: string;
	chainId: number;
	href?: string;
	logoUrl?: string;
}

interface ResolvedStablecoinGroup {
	key: string;
	label: string;
	tooltipLabel: string;
	stablecoinSlug: string;
	href: string;
	logoUrl?: string;
}

function escapeRegExp(text: string): string {
	return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function buildStablecoinTooltipLabel(
	metadata: StablecoinMetadata | undefined,
	fallbackName: string | null | undefined,
	fallbackLabel: string
): string {
	const rawLabel = metadata?.name?.trim() || fallbackName?.trim() || fallbackLabel;
	if (!rawLabel) return fallbackLabel;

	const symbol = metadata?.symbol?.trim();
	if (!symbol) return rawLabel;

	const stripped = rawLabel
		.replace(new RegExp(`\\b${escapeRegExp(symbol)}\\b`, 'ig'), '')
		.replace(/\(\s*\)/g, '')
		.replace(/\s{2,}/g, ' ')
		.trim();

	return stripped || rawLabel;
}

function resolveDisplayChain(chainId: number, fallbackName?: string): ResolvedChainGroup {
	const chain = getChain(chainId);
	if (chain) {
		return {
			key: chain.slug,
			label: chain.name,
			chainId: chain.id,
			href: `/trading-view/vaults/chains/${chain.slug}`,
			logoUrl: getLogoUrl('blockchain', chain.slug)
		};
	}

	return {
		key: `chain-${chainId}`,
		label: fallbackName ?? `Chain ${chainId}`,
		chainId
	};
}

function resolveStablecoinGroup(
	vault: Pick<VaultInfo, 'denomination' | 'normalised_denomination' | 'denomination_slug'>,
	metadataIndex: StablecoinMetadata[],
	metadataLookup = buildStablecoinMetadataLookup(metadataIndex)
): ResolvedStablecoinGroup {
	const stablecoinSlug =
		vault.denomination_slug?.trim() ||
		resolveStablecoinSlug(
			{
				slug: vault.denomination_slug,
				symbol: vault.denomination,
				name: vault.normalised_denomination
			},
			metadataLookup
		) ||
		'unknown';

	const metadata = metadataLookup.get(stablecoinSlug);
	const label =
		metadata?.symbol ||
		vault.denomination ||
		formatStablecoinDisplayName(vault.normalised_denomination, vault.denomination) ||
		vault.normalised_denomination ||
		stablecoinSlug.toUpperCase();
	const tooltipLabel = buildStablecoinTooltipLabel(
		metadata,
		formatStablecoinDisplayName(vault.normalised_denomination, vault.denomination) || vault.normalised_denomination,
		label
	);

	return {
		key: stablecoinSlug,
		label,
		tooltipLabel,
		stablecoinSlug,
		href: `/trading-view/vaults/stablecoins/${stablecoinSlug}`,
		logoUrl: getStablecoinLogoUrl(stablecoinSlug)
	};
}

export function buildStablecoinChainHeatmapPayload(
	vaults: VaultInfo[],
	stablecoinMetadataIndex: StablecoinMetadata[],
	durationMs: number,
	generatedAt = new Date(),
	options?: {
		minTvl?: number;
	}
): StablecoinChainHeatmapPayload {
	const minTvl = options?.minTvl ?? 50_000;
	const metadataLookup = buildStablecoinMetadataLookup(stablecoinMetadataIndex);
	const chainTotals = new Map<
		string,
		{ key: string; label: string; totalTvl: number; chainIds: Set<number>; href?: string; logoUrl?: string }
	>();
	const stablecoinTotals = new Map<
		string,
		{
			key: string;
			label: string;
			tooltipLabel: string;
			totalTvl: number;
			stablecoinSlug: string;
			href: string;
			logoUrl?: string;
		}
	>();
	const cells = new Map<
		string,
		StablecoinChainHeatmapCell & {
			apyWeightedSum: number;
			apyTvlWeight: number;
			monthlyReturnWeightedSum: number;
			monthlyReturnTvlWeight: number;
		}
	>();

	let includedVaults = 0;
	let excludedBlacklistedVaults = 0;
	let excludedOutlierVaults = 0;

	for (const vault of vaults) {
		if (isBlacklisted(vault)) {
			excludedBlacklistedVaults += 1;
			continue;
		}

		if (!vault.stablecoinish) continue;

		const tvl = vault.current_nav ?? 0;
		if (!Number.isFinite(tvl) || tvl <= 0 || tvl < minTvl) continue;

		if (tvl > STABLECOIN_CHAIN_HEATMAP_OUTLIER_THRESHOLD) {
			excludedOutlierVaults += 1;
			continue;
		}

		const chain = resolveDisplayChain(vault.chain_id, vault.chain);
		const stablecoin = resolveStablecoinGroup(vault, stablecoinMetadataIndex, metadataLookup);
		const cellKey = `${stablecoin.key}::${chain.key}`;

		const chainGroup = chainTotals.get(chain.key) ?? {
			key: chain.key,
			label: chain.label,
			totalTvl: 0,
			chainIds: new Set<number>(),
			href: chain.href,
			logoUrl: chain.logoUrl
		};
		chainGroup.totalTvl += tvl;
		chainGroup.chainIds.add(chain.chainId);
		chainTotals.set(chain.key, chainGroup);

		const stablecoinGroup = stablecoinTotals.get(stablecoin.key) ?? {
			key: stablecoin.key,
			label: stablecoin.label,
			tooltipLabel: stablecoin.tooltipLabel,
			totalTvl: 0,
			stablecoinSlug: stablecoin.stablecoinSlug,
			href: stablecoin.href,
			logoUrl: stablecoin.logoUrl
		};
		stablecoinGroup.totalTvl += tvl;
		stablecoinTotals.set(stablecoin.key, stablecoinGroup);

		const existingCell = cells.get(cellKey) ?? {
			chainKey: chain.key,
			stablecoinKey: stablecoin.key,
			tvl: 0,
			vaultCount: 0,
			apy: null,
			apyWeightedSum: 0,
			apyTvlWeight: 0,
			monthlyReturn: null,
			monthlyReturnWeightedSum: 0,
			monthlyReturnTvlWeight: 0
		};
		existingCell.tvl += tvl;
		existingCell.vaultCount += 1;
		const apy = vault.one_month_cagr_net ?? vault.one_month_cagr;
		if (apy != null && Number.isFinite(apy) && apy <= 10) {
			existingCell.apyWeightedSum += tvl * apy;
			existingCell.apyTvlWeight += tvl;
		}
		const monthlyReturn = vault.one_month_returns_net ?? vault.one_month_returns;
		if (monthlyReturn != null && Number.isFinite(monthlyReturn) && Math.abs(monthlyReturn) <= 10) {
			existingCell.monthlyReturnWeightedSum += tvl * monthlyReturn;
			existingCell.monthlyReturnTvlWeight += tvl;
		}
		cells.set(cellKey, existingCell);

		includedVaults += 1;
	}

	const sortedChains = [...chainTotals.values()]
		.map((group) => ({
			key: group.key,
			label: group.label,
			totalTvl: group.totalTvl,
			chainIds: [...group.chainIds].toSorted((left, right) => left - right),
			href: group.href,
			logoUrl: group.logoUrl
		}))
		.toSorted((left, right) => right.totalTvl - left.totalTvl || left.label.localeCompare(right.label))
		.slice(0, STABLECOIN_CHAIN_HEATMAP_TOP_N);

	const sortedStablecoins = [...stablecoinTotals.values()]
		.toSorted((left, right) => right.totalTvl - left.totalTvl || left.label.localeCompare(right.label))
		.map((group) => ({
			...group,
			href: group.href,
			logoUrl: group.logoUrl
		}))
		.slice(0, STABLECOIN_CHAIN_HEATMAP_TOP_N);

	const chainIndex = new Map(sortedChains.map((chain, index) => [chain.key, index]));
	const stablecoinIndex = new Map(sortedStablecoins.map((stablecoin, index) => [stablecoin.key, index]));
	const allowedChainKeys = new Set(sortedChains.map((chain) => chain.key));
	const allowedStablecoinKeys = new Set(sortedStablecoins.map((stablecoin) => stablecoin.key));

	const sortedCells = [...cells.values()]
		.filter((cell) => allowedChainKeys.has(cell.chainKey) && allowedStablecoinKeys.has(cell.stablecoinKey))
		.map((cell) => ({
			chainKey: cell.chainKey,
			stablecoinKey: cell.stablecoinKey,
			tvl: cell.tvl,
			vaultCount: cell.vaultCount,
			apy: cell.apyTvlWeight > 0 ? cell.apyWeightedSum / cell.apyTvlWeight : null,
			monthlyReturn:
				cell.monthlyReturnTvlWeight > 0 ? cell.monthlyReturnWeightedSum / cell.monthlyReturnTvlWeight : null
		}))
		.toSorted((left, right) => {
			const stablecoinOrder =
				(stablecoinIndex.get(left.stablecoinKey) ?? Number.POSITIVE_INFINITY) -
				(stablecoinIndex.get(right.stablecoinKey) ?? Number.POSITIVE_INFINITY);
			const chainOrder =
				(chainIndex.get(left.chainKey) ?? Number.POSITIVE_INFINITY) -
				(chainIndex.get(right.chainKey) ?? Number.POSITIVE_INFINITY);
			return stablecoinOrder || chainOrder;
		});

	return {
		generatedAt: generatedAt.toISOString(),
		durationMs: Math.round(durationMs),
		cacheTtlSeconds: STABLECOIN_CHAIN_HEATMAP_CACHE_TTL_SECONDS,
		chains: sortedChains,
		stablecoins: sortedStablecoins,
		cells: sortedCells,
		meta: {
			includedVaults,
			excludedBlacklistedVaults,
			excludedOutlierVaults,
			nonZeroCells: sortedCells.length
		}
	};
}

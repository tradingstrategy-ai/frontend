import { getChain, getChainDisplayName } from '$lib/helpers/chain';
import { getLogoUrl } from '$lib/helpers/assets';
import {
	isBlacklisted,
	getCore3PolForVault,
	getCore3ReportUrl,
	getVaultProtocolDisplayName
} from '$lib/top-vaults/helpers';
import type { Core3Pol, Core3Protocol, VaultInfo } from '$lib/top-vaults/schemas';
import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';
import { VAULT_TVL_OUTLIER_THRESHOLD } from './tvl-outliers';

export const CORE3_RISK_CACHE_TTL_SECONDS = 2 * 60 * 60;
export const CORE3_RISK_MIN_TVL = 50_000;
export const CORE3_RISK_OUTLIER_THRESHOLD = VAULT_TVL_OUTLIER_THRESHOLD;

export interface Core3RiskScatterPoint {
	id: string;
	name: string;
	vaultSlug: string;
	href: string;
	protocol: string;
	protocolSlug: string;
	protocolLogoUrl?: string;
	chain: string;
	chainId: number;
	chainLogoUrl?: string;
	denomination: string;
	tvl: number;
	threeMonthCagr: number | null;
	oneMonthCagr: number | null;
	core3Score: number;
	core3Rating: string | null;
	core3Confidence: string | null;
	core3ReportUrl?: string;
}

export interface Core3RiskBand {
	key: string;
	label: string;
	minScore: number | null;
	maxScore: number | null;
	tvl: number;
	vaultCount: number;
	protocolCount: number;
	weightedThreeMonthCagr: number | null;
	weightedOneMonthCagr: number | null;
}

export interface Core3RiskPayload {
	generatedAt: string;
	durationMs: number;
	cacheTtlSeconds: number;
	scatterPoints: Core3RiskScatterPoint[];
	bands: Core3RiskBand[];
	meta: {
		includedVaults: number;
		coveredVaults: number;
		uncoveredVaults: number;
		totalStablecoinTvl: number;
		coveredStablecoinTvl: number;
		uncoveredStablecoinTvl: number;
		uncoveredStablecoinTvlShare: number;
		excludedBlacklistedVaults: number;
		excludedOutlierVaults: number;
		minTvl: number;
	};
}

interface BandAccumulator extends Core3RiskBand {
	protocols: Set<string>;
	threeMonthWeightedSum: number;
	threeMonthWeight: number;
	oneMonthWeightedSum: number;
	oneMonthWeight: number;
}

const SCORE_BANDS = [
	{ key: '0-20', label: '0-20', minScore: 0, maxScore: 20 },
	{ key: '20-40', label: '20-40', minScore: 20, maxScore: 40 },
	{ key: '40-60', label: '40-60', minScore: 40, maxScore: 60 },
	{ key: '60-80', label: '60-80', minScore: 60, maxScore: 80 },
	{ key: '80-100', label: '80-100', minScore: 80, maxScore: 100 },
	{ key: 'not-covered', label: 'Not covered', minScore: null, maxScore: null }
] as const;

function createBandAccumulator(band: (typeof SCORE_BANDS)[number]): BandAccumulator {
	return {
		...band,
		tvl: 0,
		vaultCount: 0,
		protocolCount: 0,
		weightedThreeMonthCagr: null,
		weightedOneMonthCagr: null,
		protocols: new Set<string>(),
		threeMonthWeightedSum: 0,
		threeMonthWeight: 0,
		oneMonthWeightedSum: 0,
		oneMonthWeight: 0
	};
}

function getScoreBandKey(score: number | null | undefined): string {
	if (score == null || !Number.isFinite(score)) return 'not-covered';
	if (score < 20) return '0-20';
	if (score < 40) return '20-40';
	if (score < 60) return '40-60';
	if (score < 80) return '60-80';
	return '80-100';
}

function getReturn(vault: Pick<VaultInfo, 'three_months_cagr_net' | 'three_months_cagr'>): number | null {
	const value = vault.three_months_cagr_net ?? vault.three_months_cagr;
	return value != null && Number.isFinite(value) && Math.abs(value) <= 10 ? value : null;
}

function getOneMonthReturn(vault: Pick<VaultInfo, 'one_month_cagr_net' | 'one_month_cagr'>): number | null {
	const value = vault.one_month_cagr_net ?? vault.one_month_cagr;
	return value != null && Number.isFinite(value) && Math.abs(value) <= 10 ? value : null;
}

function addVaultToBand(band: BandAccumulator, vault: VaultInfo, tvl: number, threeMonthCagr: number | null) {
	const oneMonthCagr = getOneMonthReturn(vault);
	band.tvl += tvl;
	band.vaultCount += 1;
	band.protocols.add(vault.protocol_slug);

	if (threeMonthCagr != null) {
		band.threeMonthWeightedSum += tvl * threeMonthCagr;
		band.threeMonthWeight += tvl;
	}

	if (oneMonthCagr != null) {
		band.oneMonthWeightedSum += tvl * oneMonthCagr;
		band.oneMonthWeight += tvl;
	}
}

function finaliseBand(band: BandAccumulator): Core3RiskBand {
	return {
		key: band.key,
		label: band.label,
		minScore: band.minScore,
		maxScore: band.maxScore,
		tvl: band.tvl,
		vaultCount: band.vaultCount,
		protocolCount: band.protocols.size,
		weightedThreeMonthCagr: band.threeMonthWeight > 0 ? band.threeMonthWeightedSum / band.threeMonthWeight : null,
		weightedOneMonthCagr: band.oneMonthWeight > 0 ? band.oneMonthWeightedSum / band.oneMonthWeight : null
	};
}

function buildScatterPoint(
	vault: VaultInfo,
	pol: Core3Pol,
	core3Protocol: Core3Protocol | undefined
): Core3RiskScatterPoint | null {
	const tvl = vault.current_nav ?? 0;
	const threeMonthCagr = getReturn(vault);
	if (!(tvl > 0) || threeMonthCagr == null || pol.score == null || !Number.isFinite(pol.score)) return null;

	const chain = getChain(vault.chain_id);
	const reportUrl = core3Protocol ? getCore3ReportUrl(core3Protocol) : undefined;

	return {
		id: vault.id,
		name: vault.name,
		vaultSlug: vault.vault_slug,
		href: `/vaults/${vault.vault_slug}`,
		protocol: getVaultProtocolDisplayName(vault),
		protocolSlug: vault.protocol_slug,
		protocolLogoUrl: getVaultProtocolLogoUrl(vault.protocol_slug),
		chain: chain ? getChainDisplayName(vault.chain_id) : (vault.chain ?? `Chain ${vault.chain_id}`),
		chainId: vault.chain_id,
		chainLogoUrl: chain ? getLogoUrl('blockchain', chain.slug) : undefined,
		denomination: vault.denomination ?? vault.normalised_denomination ?? 'Stablecoin',
		tvl,
		threeMonthCagr,
		oneMonthCagr: getOneMonthReturn(vault),
		core3Score: pol.score,
		core3Rating: pol.rating,
		core3Confidence: pol.confidence,
		core3ReportUrl: reportUrl
	};
}

export function buildCore3RiskPayload(
	vaults: VaultInfo[],
	core3Protocols: Record<string, Core3Protocol>,
	durationMs: number,
	generatedAt = new Date(),
	options?: { minTvl?: number }
): Core3RiskPayload {
	const minTvl = options?.minTvl ?? CORE3_RISK_MIN_TVL;
	const bandMap = new Map<string, BandAccumulator>(SCORE_BANDS.map((band) => [band.key, createBandAccumulator(band)]));
	const scatterPoints: Core3RiskScatterPoint[] = [];

	let includedVaults = 0;
	let coveredVaults = 0;
	let uncoveredVaults = 0;
	let totalStablecoinTvl = 0;
	let coveredStablecoinTvl = 0;
	let uncoveredStablecoinTvl = 0;
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

		if (tvl > CORE3_RISK_OUTLIER_THRESHOLD) {
			excludedOutlierVaults += 1;
			continue;
		}

		const core3Protocol = core3Protocols[vault.protocol_slug];
		const pol = getCore3PolForVault(vault, core3Protocols);
		const score = pol?.score ?? null;
		const band = bandMap.get(getScoreBandKey(score)) ?? bandMap.get('not-covered');
		if (!band) continue;

		const threeMonthCagr = getReturn(vault);
		addVaultToBand(band, vault, tvl, threeMonthCagr);

		includedVaults += 1;
		totalStablecoinTvl += tvl;

		if (score != null && Number.isFinite(score)) {
			coveredVaults += 1;
			coveredStablecoinTvl += tvl;
			const point = pol ? buildScatterPoint(vault, pol, core3Protocol) : null;
			if (point) scatterPoints.push(point);
		} else {
			uncoveredVaults += 1;
			uncoveredStablecoinTvl += tvl;
		}
	}

	const bands = SCORE_BANDS.map((band) => finaliseBand(bandMap.get(band.key) ?? createBandAccumulator(band)));

	return {
		generatedAt: generatedAt.toISOString(),
		durationMs,
		cacheTtlSeconds: CORE3_RISK_CACHE_TTL_SECONDS,
		scatterPoints: scatterPoints.toSorted(
			(left, right) => left.core3Score - right.core3Score || right.tvl - left.tvl || left.name.localeCompare(right.name)
		),
		bands,
		meta: {
			includedVaults,
			coveredVaults,
			uncoveredVaults,
			totalStablecoinTvl,
			coveredStablecoinTvl,
			uncoveredStablecoinTvl,
			uncoveredStablecoinTvlShare: totalStablecoinTvl > 0 ? uncoveredStablecoinTvl / totalStablecoinTvl : 0,
			excludedBlacklistedVaults,
			excludedOutlierVaults,
			minTvl
		}
	};
}

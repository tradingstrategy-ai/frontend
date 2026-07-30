/**
 * Filter and summarise vaults covered by a third-party risk-rating provider.
 */
import type { RiskRatingProvider } from './risk-rating-providers';
import type { TopVaults, VaultInfo } from './schemas';
import {
	calculateTotalTvl,
	calculateTvlWeightedApy,
	getCore3PolForVault,
	getCore3RatingTone,
	getVaultCurrentTvlUsd,
	isBlacklisted
} from './helpers';
import type { Core3RatingTone } from './helpers';

export type RiskRatingStatistics = {
	totalTvl: number;
	vaultCount: number;
	blockchainCount: number;
	averageMonthlyReturn: number | null;
};

/** One of the six score bands used to visualise rated TVL. */
export type RiskRatingTvlBand = {
	slug: string;
	label: string;
	name: string;
	tvl: number;
	avgApy: number | null;
	tone?: Core3RatingTone;
};

const RISK_RATING_BAND_COUNT = 6;
const RISK_RATING_SCORE_MAX = 100;
const CORE3_RATING_ORDER = ['AAA', 'AA', 'A', 'BBB', 'BB', 'B', 'CCC', 'CC', 'C', 'DDD', 'DD', 'D'];

function getRiskScore(vault: VaultInfo, topVaults: TopVaults, provider: RiskRatingProvider): number | null {
	if (provider === 'xerberus') return vault.xerberus?.score ?? null;

	return getCore3PolForVault(vault, topVaults.core3_protocols)?.score ?? null;
}

function getRiskBandLabel(index: number): string {
	const lowerBound = Math.ceil((index * RISK_RATING_SCORE_MAX) / RISK_RATING_BAND_COUNT);
	const upperBound =
		index === RISK_RATING_BAND_COUNT - 1
			? RISK_RATING_SCORE_MAX
			: Math.ceil(((index + 1) * RISK_RATING_SCORE_MAX) / RISK_RATING_BAND_COUNT) - 1;

	return `${lowerBound}–${upperBound}`;
}

function getRiskBandDescription(provider: RiskRatingProvider, index: number): string {
	const safestBand = provider === 'core3' ? 0 : RISK_RATING_BAND_COUNT - 1;
	const riskiestBand = provider === 'core3' ? RISK_RATING_BAND_COUNT - 1 : 0;

	if (index === safestBand) return 'safest scores';
	if (index === riskiestBand) return 'highest risk scores';

	return 'risk score range';
}

/** Return all non-blacklisted vaults with a rating from the selected provider. */
export function getRiskRatedVaults(topVaults: TopVaults, provider: RiskRatingProvider): VaultInfo[] {
	return topVaults.vaults.filter((vault) => {
		if (isBlacklisted(vault)) return false;
		if (provider === 'xerberus') return vault.xerberus?.score != null;

		const core3 = getCore3PolForVault(vault, topVaults.core3_protocols);
		return core3?.score != null && core3.rating != null;
	});
}

/** Calculate USD TVL, coverage, and TVL-weighted one-month return for rated vaults. */
export function getRiskRatingStatistics(vaults: VaultInfo[]): RiskRatingStatistics {
	const vaultsWithUsdTvl = vaults.map((vault) => ({ ...vault, current_nav: getVaultCurrentTvlUsd(vault) }));

	return {
		totalTvl: calculateTotalTvl(vaultsWithUsdTvl),
		vaultCount: vaults.length,
		blockchainCount: new Set(vaults.map((vault) => vault.chain_id)).size,
		averageMonthlyReturn: calculateTvlWeightedApy(vaultsWithUsdTvl)
	};
}

function getCore3RatingDescription(tone: Core3RatingTone): string {
	if (tone === 'excellent') return 'lowest risk';
	if (tone === 'good') return 'lower risk';
	if (tone === 'fair') return 'higher risk';
	if (tone === 'poor') return 'highest risk';

	return 'risk rating';
}

/** Group CORE3-rated vault TVL by its published letter grades, safest first. */
function getCore3RatingTvlBands(topVaults: TopVaults): RiskRatingTvlBand[] {
	const vaultsByRating = new Map<string, VaultInfo[]>();

	for (const vault of getRiskRatedVaults(topVaults, 'core3')) {
		const rating = getCore3PolForVault(vault, topVaults.core3_protocols)?.rating?.toUpperCase();
		if (!rating) continue;

		const ratedVaults = vaultsByRating.get(rating) ?? [];
		ratedVaults.push(vault);
		vaultsByRating.set(rating, ratedVaults);
	}

	return Array.from(vaultsByRating.entries())
		.toSorted(([leftRating], [rightRating]) => {
			const leftIndex = CORE3_RATING_ORDER.indexOf(leftRating);
			const rightIndex = CORE3_RATING_ORDER.indexOf(rightRating);
			return (
				(leftIndex < 0 ? Infinity : leftIndex) - (rightIndex < 0 ? Infinity : rightIndex) ||
				leftRating.localeCompare(rightRating)
			);
		})
		.map(([rating, vaults]) => {
			const tone = getCore3RatingTone(rating);
			const vaultsWithUsdTvl = vaults.map((vault) => ({ ...vault, current_nav: getVaultCurrentTvlUsd(vault) }));

			return {
				slug: `core3-${rating.toLowerCase()}`,
				label: rating,
				name: `${rating} · ${getCore3RatingDescription(tone)}`,
				tvl: calculateTotalTvl(vaultsWithUsdTvl),
				avgApy: calculateTvlWeightedApy(vaultsWithUsdTvl),
				tone
			};
		});
}

/**
 * Group a provider's rated vault TVL into six evenly sized score ranges.
 * CORE3 considers lower scores safer, whereas Xerberus considers higher
 * scores safer; the ranges stay numeric so both distributions are comparable.
 *
 * @param topVaults - Complete vault payload, including CORE3 protocol scores.
 * @param provider - Risk provider whose rated vaults are grouped.
 */
export function getRiskRatingTvlBands(topVaults: TopVaults, provider: RiskRatingProvider): RiskRatingTvlBand[] {
	if (provider === 'core3') return getCore3RatingTvlBands(topVaults);

	const bands = Array.from({ length: RISK_RATING_BAND_COUNT }, (_, index) => ({
		slug: `risk-${index + 1}`,
		label: getRiskBandLabel(index),
		name: `${getRiskBandLabel(index)} · ${getRiskBandDescription(provider, index)}`,
		vaults: [] as VaultInfo[]
	}));

	for (const vault of getRiskRatedVaults(topVaults, provider)) {
		const score = getRiskScore(vault, topVaults, provider);
		if (score == null || !Number.isFinite(score)) continue;

		const clampedScore = Math.max(0, Math.min(RISK_RATING_SCORE_MAX, score));
		const bandIndex = Math.min(
			RISK_RATING_BAND_COUNT - 1,
			Math.floor((clampedScore / RISK_RATING_SCORE_MAX) * RISK_RATING_BAND_COUNT)
		);
		bands[bandIndex].vaults.push(vault);
	}

	return bands.map(({ vaults, ...band }) => {
		const vaultsWithUsdTvl = vaults.map((vault) => ({ ...vault, current_nav: getVaultCurrentTvlUsd(vault) }));

		return {
			...band,
			tvl: calculateTotalTvl(vaultsWithUsdTvl),
			avgApy: calculateTvlWeightedApy(vaultsWithUsdTvl)
		};
	});
}

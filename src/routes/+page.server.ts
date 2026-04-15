import { getCachedStrategies } from 'trade-executor/client/strategy-info';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { compareStrategiesForFrontpage } from '$lib/strategies/sort';
import { toListingStrategy } from '$lib/strategies/yaml/adapter';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { type SlimVaultInfo, type VaultAggregates } from '$lib/top-vaults/schemas';
import {
	calculateTotalTvl,
	isBlacklisted,
	meetsDefaultTvl,
	meetsMinTvl,
	rankVaultsBy,
	slimVault
} from '$lib/top-vaults/helpers';
import { getCachedSharePriceReturns } from '$lib/strategies/yaml/share-price';
import { fetchLatestFredValue, fetchLatestTreasuryRate } from '$lib/reference-rates';

const HOME_PAGE_EDGE_CACHE_TTL_SECONDS = 30 * 60;

function getAgeSeconds(dateValue: Date | string | null | undefined) {
	if (!dateValue) return null;

	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.valueOf())) return null;

	return Math.max(0, Math.floor((Date.now() - parsed.valueOf()) / 1000));
}

export async function load({ fetch }) {
	const [strategies, topVaultsResult, ratesResult] = await Promise.all([
		getCachedStrategies(fetch),
		fetchTopVaults(fetch).catch((e) => {
			console.error('Failed to fetch top vaults:', e);
			return undefined;
		}),
		Promise.all([fetchLatestFredValue('SNDR'), fetchLatestTreasuryRate()])
	]);

	const frontpageStrategies = strategies.filter((s) => s.frontpage);
	const yamlTileFreshness: {
		strategyId: string;
		vaultId: string | null;
		sharePriceCacheAgeSeconds: number | null;
		sharePriceCacheTtlSeconds: number;
		sharePriceSeriesEndAt: string | null;
	}[] = [];

	// Add YAML strategies with frontpage flag
	const yamlFrontpage = [...yamlStrategies.values()].filter((c) => c.frontpage);
	if (yamlFrontpage.length > 0 && topVaultsResult) {
		try {
			for (const config of yamlFrontpage) {
				const vault = topVaultsResult.vaults.find((v) => v.address === config.vault_address);
				const sharePriceReturns = vault ? await getCachedSharePriceReturns(fetch, vault.id) : undefined;
				yamlTileFreshness.push({
					strategyId: config.slug,
					vaultId: vault?.id ?? null,
					sharePriceCacheAgeSeconds: vault ? getCachedSharePriceReturns.getAge(fetch, vault.id) : null,
					sharePriceCacheTtlSeconds: getCachedSharePriceReturns.ttl,
					sharePriceSeriesEndAt: sharePriceReturns?.length
						? new Date(sharePriceReturns.at(-1)![0] * 1000).toISOString()
						: null
				});
				frontpageStrategies.push(toListingStrategy(config, vault, sharePriceReturns));
			}
		} catch (e) {
			console.error('Failed to fetch vault data for frontpage YAML strategies:', e);
			for (const config of yamlFrontpage) {
				frontpageStrategies.push(toListingStrategy(config));
			}
		}
	} else if (yamlFrontpage.length > 0) {
		for (const config of yamlFrontpage) {
			frontpageStrategies.push(toListingStrategy(config));
		}
	}

	frontpageStrategies.sort(compareStrategiesForFrontpage);

	const [savingsRate, treasuryRate] = ratesResult;

	let topVaults: { generated_at: Date | string; vaults: SlimVaultInfo[]; aggregates: VaultAggregates } | undefined;

	if (topVaultsResult) {
		const allSlim = topVaultsResult.vaults.map(slimVault);
		const baseVaults = allSlim.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));
		const rankedVaults = baseVaults
			.filter(meetsDefaultTvl)
			.sort(rankVaultsBy(['one_month_cagr', 'one_month_cagr_net']))
			.reverse();

		const totalTvl = calculateTotalTvl(baseVaults);
		const rankedTvl = calculateTotalTvl(rankedVaults);
		const weightedAvgApy =
			rankedTvl > 0
				? rankedVaults.reduce((acc, v) => {
						const weight = (v.current_nav ?? 0) / rankedTvl;
						return acc + weight * (v.one_month_cagr_net ?? v.one_month_cagr ?? 0);
					}, 0)
				: 0;

		topVaults = {
			generated_at: topVaultsResult.generated_at,
			vaults: rankedVaults.slice(0, 30),
			aggregates: {
				totalTvl,
				weightedAvgApy,
				rankedVaultCount: rankedVaults.length
			}
		};
	}

	return {
		debugFreshness: {
			renderedAt: new Date().toISOString(),
			httpEdgeCacheTtlSeconds: HOME_PAGE_EDGE_CACHE_TTL_SECONDS,
			apiStrategiesCache: {
				ttlSeconds: getCachedStrategies.ttl,
				ageSeconds: getCachedStrategies.getAge(fetch)
			},
			topVaultsFeed: topVaultsResult
				? {
						generatedAt: new Date(topVaultsResult.generated_at).toISOString(),
						ageSeconds: getAgeSeconds(topVaultsResult.generated_at)
					}
				: null,
			yamlTileSharePriceCache: {
				ttlSeconds: getCachedSharePriceReturns.ttl,
				strategies: yamlTileFreshness
			}
		},
		strategies: frontpageStrategies,
		savingsRate,
		treasuryRate,
		topVaults
	};
}

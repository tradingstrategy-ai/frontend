import { redirect } from '@sveltejs/kit';
import { getChainDisplayName } from '$lib/helpers/chain';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	canonicaliseComparisonVaultIds,
	canonicaliseComparisonBenchmarks,
	EMPTY_COMPARISON_PARAMETER,
	EMPTY_COMPARISON_VALUE,
	MAX_SELECTED_VAULTS,
	parseEquityComparisonState,
	writeEquityComparisonState
} from '$lib/top-vaults/equity-comparison/state';
import { comparisonBenchmarkKeys, type ComparisonVault } from '$lib/top-vaults/equity-comparison/types';
import { getVaultProtocolDisplayName, isBlacklisted, resolveVaultDetails } from '$lib/top-vaults/helpers';
import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers';
import { getVaultCompareMeta } from './compare-meta';

export async function load({ fetch, url }) {
	const requestedVaultIds = url.searchParams.getAll('vault');
	const requestedBenchmarks = url.searchParams.getAll('benchmark');
	const requestedPeriods = url.searchParams.getAll('period');
	const requestedState = parseEquityComparisonState(url.searchParams);
	const topVaults = await getCachedTopVaults(fetch);
	const hasExplicitComparisonState =
		requestedVaultIds.length > 0 ||
		url.searchParams.has('benchmark') ||
		url.searchParams.get(EMPTY_COMPARISON_PARAMETER) === EMPTY_COMPARISON_VALUE;

	if (!hasExplicitComparisonState) {
		const defaultVault = topVaults.vaults.find((vault) => vault.name === 'Savings USDS');
		if (defaultVault) {
			const defaultSearchParams = writeEquityComparisonState(url.searchParams, {
				vaultIds: [defaultVault.id],
				benchmarks: [...comparisonBenchmarkKeys],
				timeSpan: requestedState.timeSpan
			});
			redirect(307, `${url.pathname}?${defaultSearchParams}`);
		}
	}

	const canonicalVaultIds = canonicaliseComparisonVaultIds(requestedVaultIds);
	const canonicalBenchmarks = canonicaliseComparisonBenchmarks(requestedBenchmarks);
	const canonicalTimeSpan = requestedState.timeSpan;
	const vaultById = new Map(topVaults.vaults.map((vault) => [vault.id, vault]));
	const resolvedVaultIds = canonicalVaultIds.filter((vaultId) => vaultById.has(vaultId));
	const hasStaleEmptyMarker =
		resolvedVaultIds.length > 0 && url.searchParams.get(EMPTY_COMPARISON_PARAMETER) === EMPTY_COMPARISON_VALUE;

	if (
		requestedVaultIds.length > MAX_SELECTED_VAULTS ||
		requestedVaultIds.length !== resolvedVaultIds.length ||
		requestedVaultIds.some((value, index) => value !== resolvedVaultIds[index]) ||
		requestedBenchmarks.length !== canonicalBenchmarks.length ||
		requestedBenchmarks.some((value, index) => value !== canonicalBenchmarks[index]) ||
		requestedPeriods.length !== 1 ||
		requestedPeriods[0] !== canonicalTimeSpan ||
		hasStaleEmptyMarker
	) {
		const canonicalSearchParams = writeEquityComparisonState(url.searchParams, {
			vaultIds: resolvedVaultIds,
			benchmarks: canonicalBenchmarks,
			timeSpan: canonicalTimeSpan
		});
		redirect(307, `${url.pathname}?${canonicalSearchParams}`);
	}

	const selectedVaultRecords = resolvedVaultIds.map((vaultId) => vaultById.get(vaultId)!);
	const selectedVaults: ComparisonVault[] = selectedVaultRecords.map((vault) => {
		const curatorLogos = vault.curator_slug ? topVaults.curators[vault.curator_slug]?.logos : undefined;
		const logoUrl =
			curatorLogos?.generic ??
			curatorLogos?.light ??
			curatorLogos?.dark ??
			getVaultProtocolLogoUrl(vault.protocol_slug) ??
			null;

		return {
			id: vault.id,
			name: vault.name,
			href: resolveVaultDetails(vault),
			logoUrl,
			protocolName: getVaultProtocolDisplayName(vault),
			chainName: getChainDisplayName(vault.chain_id),
			entityType: isBlacklisted(vault)
				? 'blacklisted-vault'
				: vault.flags.includes('tokenised_fund')
					? 'tokenised-fund'
					: 'vault'
		};
	});
	const selectedCurators = Object.fromEntries(
		selectedVaultRecords.flatMap((vault) => {
			const curator = vault.curator_slug ? topVaults.curators[vault.curator_slug] : undefined;
			return curator && vault.curator_slug ? [[vault.curator_slug, curator]] : [];
		})
	);

	return {
		compareMeta: getVaultCompareMeta(url.searchParams, topVaults.vaults),
		selectedVaults,
		selectedTopVaults: {
			generated_at: topVaults.generated_at,
			vaults: selectedVaultRecords,
			core3_protocols: {},
			curators: selectedCurators
		}
	};
}

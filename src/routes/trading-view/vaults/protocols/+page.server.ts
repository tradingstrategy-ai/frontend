import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	calculateTvlWeightedApy,
	getCore3PolForVault,
	getProtocolDisplayName,
	isBlacklisted,
	isUnknownVaultProtocol,
	meetsMinTvl,
	UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME,
	UNKNOWN_VAULT_PROTOCOL_SLUG
} from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';
import { getVaultProtocolLogoUrl } from '$lib/vault-protocol/helpers.js';
import type { MarketShareChartItem } from '../market-share-pie';

export async function load({ fetch, url: { searchParams } }) {
	const { vaults, core3_protocols } = await getCachedTopVaults(fetch);

	const eligibleVaults = vaults.filter((v) => !isBlacklisted(v) && meetsMinTvl(v));

	const protocols = eligibleVaults.reduce<Record<string, VaultGroup>>((acc, vault) => {
		const isUnknown = isUnknownVaultProtocol(vault);
		const slug = isUnknown ? UNKNOWN_VAULT_PROTOCOL_SLUG : vault.protocol_slug;
		const core3Pol = getCore3PolForVault(vault, core3_protocols);

		acc[slug] ??= {
			slug,
			name: isUnknown
				? UNKNOWN_VAULT_PROTOCOL_DISPLAY_NAME
				: getProtocolDisplayName(vault.protocol, vault.protocol_slug),
			vault_count: 0,
			tvl: 0,
			avg_apy: null,
			risk: vault.risk,
			risk_numeric: vault.risk_numeric,
			core3_rating: core3Pol?.rating ?? null,
			core3_score: core3Pol?.score ?? null
		};
		acc[slug].core3_rating ??= core3Pol?.rating ?? null;
		acc[slug].core3_score ??= core3Pol?.score ?? null;
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		return acc;
	}, {});

	// Calculate TVL-weighted average APY for each protocol
	const protocolGroups: VaultGroup[] = Object.values(protocols).map((group) => ({
		...group,
		avg_apy: calculateTvlWeightedApy(
			eligibleVaults.filter((vault) =>
				group.slug === UNKNOWN_VAULT_PROTOCOL_SLUG ? isUnknownVaultProtocol(vault) : vault.protocol_slug === group.slug
			)
		)
	}));

	const chartProtocols: MarketShareChartItem[] = protocolGroups.map((group) => ({
		slug: group.slug,
		label: group.name,
		name: group.name,
		tvl: group.tvl,
		avgApy: group.avg_apy ?? null,
		logoUrl: getVaultProtocolLogoUrl(group.slug),
		href: `/trading-view/vaults/protocols/${group.slug}`
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		protocols: protocolGroups,
		chartProtocols,
		options
	};
}

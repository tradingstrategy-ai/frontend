import type { VaultGroup } from '$lib/top-vaults/schemas.js';
import { isBlacklisted, meetsMinTvl } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultGroupTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();

	type ProtocolAccumulator = VaultGroup & { weighted_apy_sum: number; tvl_with_apy: number };

	const protocols = topVaults.vaults.reduce<Record<string, ProtocolAccumulator>>((acc, vault) => {
		if (isBlacklisted(vault) || !meetsMinTvl(vault)) return acc;

		const slug = vault.protocol_slug;

		acc[slug] ??= {
			slug,
			name: vault.protocol,
			vault_count: 0,
			tvl: 0,
			avg_apy: null,
			risk: vault.risk,
			risk_numeric: vault.risk_numeric,
			weighted_apy_sum: 0,
			tvl_with_apy: 0
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;

		// Accumulate for TVL-weighted average APY calculation
		if (vault.one_month_cagr != null && vault.current_nav != null && vault.current_nav > 0) {
			acc[slug].weighted_apy_sum += vault.one_month_cagr * vault.current_nav;
			acc[slug].tvl_with_apy += vault.current_nav;
		}

		return acc;
	}, {});

	// Calculate final TVL-weighted average APY and remove accumulator fields
	const protocolGroups: VaultGroup[] = Object.values(protocols).map(({ weighted_apy_sum, tvl_with_apy, ...group }) => ({
		...group,
		avg_apy: tvl_with_apy > 0 ? weighted_apy_sum / tvl_with_apy : null
	}));

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		protocols: protocolGroups,
		options
	};
}

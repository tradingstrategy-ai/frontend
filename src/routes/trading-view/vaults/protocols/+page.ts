import type { VaultProtocol } from '$lib/top-vaults/schemas.js';
import { isBlacklisted } from '$lib/top-vaults/helpers.js';
import { sortOptions } from '$lib/top-vaults/VaultProtocolTable.svelte';
import { getNumberParam, getStringParam } from '$lib/helpers/url-params';

export async function load({ parent, url: { searchParams } }) {
	const { topVaults } = await parent();
	const protocols = topVaults.vaults.reduce<Record<string, VaultProtocol>>((acc, vault) => {
		if (isBlacklisted(vault)) return acc;

		const slug = vault.protocol_slug;

		acc[slug] ??= {
			slug,
			name: vault.protocol,
			risk: vault.risk,
			risk_numeric: vault.risk_numeric,
			vault_count: 0,
			tvl: 0
		};
		acc[slug].vault_count++;
		acc[slug].tvl += vault.current_nav ?? 0;
		return acc;
	}, {});

	const options = {
		page: getNumberParam(searchParams, 'page', 0),
		sort: getStringParam(searchParams, 'sort', sortOptions.keys),
		direction: getStringParam(searchParams, 'direction', sortOptions.directions)
	};

	return {
		protocols: Object.values(protocols),
		options
	};
}

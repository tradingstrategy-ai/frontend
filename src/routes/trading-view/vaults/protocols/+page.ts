import type { VaultProtocol } from '$lib/top-vaults/schemas.js';
import { isBlacklisted } from '$lib/top-vaults/helpers.js';

export async function load({ parent }) {
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

	return {
		protocols: Object.values(protocols)
	};
}

import type { VaultProtocol } from '$lib/top-vaults/schemas.js';
import { slugify } from '$lib/helpers/slugify';

export async function load({ parent }) {
	const { topVaults } = await parent();

	const protocols = topVaults.vaults.reduce<Record<string, VaultProtocol>>((acc, vault) => {
		if (vault.risk_numeric === 999) return acc;

		const slug = slugify(vault.protocol);
		acc[slug] ??= {
			slug,
			name: vault.protocol,
			risk: vault.risk,
			risk_numeric: vault.risk_numeric,
			vault_count: 0
		};
		acc[slug].vault_count++;
		return acc;
	}, {});

	return {
		protocols: Object.values(protocols)
	};
}

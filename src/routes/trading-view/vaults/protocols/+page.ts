import { slugify } from '$lib/helpers/slugify';

interface Protocol {
	slug: string;
	name: string;
	vaultCount: number;
}

export async function load({ parent }) {
	const { topVaults } = await parent();

	const protocols = topVaults.vaults.reduce<Record<string, Protocol>>((acc, vault) => {
		const slug = slugify(vault.protocol);
		acc[slug] ??= { slug, name: vault.protocol, vaultCount: 0 };
		acc[slug].vaultCount++;
		return acc;
	}, {});

	return {
		protocols: Object.values(protocols)
	};
}

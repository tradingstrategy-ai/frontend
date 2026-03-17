import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';

export async function load({ params, fetch }) {
	const { denomination } = params;

	const [{ vaults }, metadataIndex] = await Promise.all([
		getCachedTopVaults(fetch),
		fetchStablecoinMetadataIndex(fetch)
	]);

	const stablecoinMetadata = metadataIndex.find((m) => m.slug === denomination);

	const match = vaults.find((v) => v.denomination_slug === denomination);

	// 404 only if neither vault data nor metadata exists
	if (!match && !stablecoinMetadata) error(404, 'Vault stablecoin not found');

	return {
		denominationSlug: denomination,
		denominationSymbol: stablecoinMetadata?.symbol ?? match?.denomination ?? denomination.toUpperCase(),
		denominationName: stablecoinMetadata?.name ?? match?.normalised_denomination ?? denomination,
		stablecoinMetadata
	};
}

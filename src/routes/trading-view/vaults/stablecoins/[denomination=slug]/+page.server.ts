import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import {
	buildStablecoinMetadataLookup,
	formatStablecoinDisplayName,
	findStablecoinMetadata,
	OFFCHAIN_USD_STABLECOIN_SLUG,
	OFFCHAIN_USD_SHORT_DESCRIPTION,
	resolveStablecoinSlug
} from '$lib/stablecoin-metadata/helpers';

export async function load({ params, fetch }) {
	const { denomination } = params;

	const [{ vaults }, metadataIndex] = await Promise.all([
		getCachedTopVaults(fetch),
		fetchStablecoinMetadataIndex(fetch)
	]);

	const metadataLookup = buildStablecoinMetadataLookup(metadataIndex);
	const stablecoinMetadata = findStablecoinMetadata(metadataLookup, denomination);

	const match = vaults.find((v) => {
		const slug = resolveStablecoinSlug(
			{
				slug: v.denomination_slug,
				symbol: v.denomination,
				name: v.normalised_denomination
			},
			metadataLookup
		);
		return slug === denomination;
	});

	// Off-chain USD is a recognised accounting denomination even if no vault is
	// currently present in the dataset, so retain its standalone information page.
	if (!match && !stablecoinMetadata && denomination !== OFFCHAIN_USD_STABLECOIN_SLUG) {
		error(404, 'Vault stablecoin not found');
	}

	const denominationSymbol = stablecoinMetadata?.symbol ?? match?.denomination ?? denomination.toUpperCase();
	const denominationName =
		formatStablecoinDisplayName(
			stablecoinMetadata?.name ?? match?.normalised_denomination ?? denomination,
			denominationSymbol
		) ?? denomination;

	return {
		denominationSlug: denomination,
		denominationSymbol,
		denominationName,
		shortDescription:
			denomination === OFFCHAIN_USD_STABLECOIN_SLUG
				? OFFCHAIN_USD_SHORT_DESCRIPTION
				: (stablecoinMetadata?.short_description ?? null),
		stablecoinMetadata
	};
}

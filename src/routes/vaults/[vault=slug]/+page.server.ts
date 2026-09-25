import { getChain } from '$lib/helpers/chain';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { buildStablecoinMetadataLookup, findVaultStablecoinMetadata } from '$lib/stablecoin-metadata/helpers';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { getVaultCategoryLinks } from '$lib/top-vaults/categories';
import {
	getCore3ProtocolForVault,
	getCurrencyUsdRates,
	isVaultIndexable,
	resolveVaultDetails,
	withVaultDenominationTokenRate
} from '$lib/top-vaults/helpers.js';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';
import { getSimilarVaults } from '$lib/top-vaults/similar-vaults';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const { vaults, generated_at, core3_protocols, curators, categories } = await getCachedTopVaults(fetch);

	const vault = vaults.find((v) => {
		// redirect to canonical vault path if someone tries old vault id URL
		if (v.id === params.vault) {
			redirect(301, resolveVaultDetails(v));
		}

		return v.vault_slug === params.vault;
	});

	if (!vault) error(404, 'Vault not found');

	const chain = getChain(vault.chain_id);
	if (!chain) error(404, 'Chain not found');

	const core3 = getCore3ProtocolForVault(vault, core3_protocols);

	const [protocolMetadata, stablecoinMetadataIndex] = await Promise.all([
		fetchVaultProtocolMetadata(fetch, vault.protocol_slug, vault.protocol),
		fetchStablecoinMetadataIndex(fetch)
	]);
	const stablecoinLookup = buildStablecoinMetadataLookup(stablecoinMetadataIndex);
	const usdRates = getCurrencyUsdRates(stablecoinMetadataIndex);
	const stablecoinMetadata = findVaultStablecoinMetadata(stablecoinLookup, vault);
	const vaultWithRates = withVaultDenominationTokenRate(vault, stablecoinMetadata, usdRates);
	const curatorMetadata = vault.curator_slug ? curators[vault.curator_slug] : null;

	return {
		robots: isVaultIndexable(vaultWithRates) ? undefined : 'noindex,follow',
		vault: vaultWithRates,
		chain,
		protocolMetadata,
		curatorMetadata,
		stablecoinMetadata,
		generated_at,
		core3,
		categoryLinks: getVaultCategoryLinks(vault, categories),
		similarVaults: getSimilarVaults(vault, vaults, {
			withRates: (candidate) =>
				withVaultDenominationTokenRate(candidate, findVaultStablecoinMetadata(stablecoinLookup, candidate), usdRates)
		})
	};
}

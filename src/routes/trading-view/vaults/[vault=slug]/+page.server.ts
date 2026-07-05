import { getChain } from '$lib/helpers/chain';
import { fetchStablecoinMetadataIndex } from '$lib/stablecoin-metadata/client';
import { buildStablecoinMetadataLookup, findStablecoinMetadata } from '$lib/stablecoin-metadata/helpers';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import {
	getCore3ProtocolForVault,
	getCurrencyUsdRates,
	resolveVaultDetails,
	withVaultDenominationTokenRate
} from '$lib/top-vaults/helpers.js';
import { fetchVaultProtocolMetadata } from '$lib/vault-protocol/client';
import { error, redirect } from '@sveltejs/kit';

export async function load({ params, fetch }) {
	const { vaults, generated_at, core3_protocols, curators } = await getCachedTopVaults(fetch);

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
	const stablecoinMetadataLookup = buildStablecoinMetadataLookup(stablecoinMetadataIndex);
	const stablecoinMetadata = findStablecoinMetadata(
		stablecoinMetadataLookup,
		vault.denomination_slug,
		vault.denomination,
		vault.normalised_denomination
	);
	const vaultWithRates = withVaultDenominationTokenRate(
		vault,
		stablecoinMetadata,
		getCurrencyUsdRates(stablecoinMetadataIndex)
	);
	const curatorMetadata = vault.curator_slug ? curators[vault.curator_slug] : null;

	return { vault: vaultWithRates, chain, protocolMetadata, curatorMetadata, stablecoinMetadata, generated_at, core3 };
}

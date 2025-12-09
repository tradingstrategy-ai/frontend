import { resolve } from '$app/paths';
import { getChain } from '$lib/helpers/chain';
import type { VaultInfo } from './schemas';

export function resolveVaultDetails(vault: VaultInfo) {
	const chain = getChain(vault.chain_id);
	return resolve(`/trading-view/${chain?.slug}/vaults/${vault.vault_slug}`);
}

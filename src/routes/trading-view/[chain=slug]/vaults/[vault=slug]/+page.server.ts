import { redirect } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { resolveVaultDetails } from '$lib/top-vaults/helpers';

/**
 * Redirect to new vault details route.
 *
 * Legacy Hyperliquid vault links carry the vault address in `?a=0x…` and a slug that has
 * since changed (`rektober-2` → `rektober`), so prefer the address when present. It is
 * resolved here against the server-cached export, so the visitor gets one redirect to the
 * current vault page instead of two (each costs a round trip on mobile). An address the
 * export does not know still goes to `/vaults/address/[address]`, which answers 404.
 */
export async function load({ params, url, fetch }) {
	const address = url.searchParams.get('a');
	if (address && /^0x[0-9a-f]{40}$/i.test(address)) {
		const lowerCaseAddress = address.toLowerCase();
		const { vaults } = await getCachedTopVaults(fetch);
		const vault = vaults.find((v) => v.address.toLowerCase() === lowerCaseAddress);
		redirect(301, vault ? resolveVaultDetails(vault) : `/vaults/address/${lowerCaseAddress}`);
	}
	redirect(301, `/vaults/${params.vault}`);
}

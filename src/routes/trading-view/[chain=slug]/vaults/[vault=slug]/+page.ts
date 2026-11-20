import { redirect } from '@sveltejs/kit';

/**
 * Redirect to new vault details route.
 *
 * Legacy Hyperliquid vault links carry the vault address in `?a=0x…` and a slug that has
 * since changed (`rektober-2` → `rektober`), so prefer the address when present and let
 * `/vaults/address/[address]` resolve the current slug.
 */
export function load({ params, url }) {
	const address = url.searchParams.get('a');
	if (address && /^0x[0-9a-f]{40}$/i.test(address)) {
		redirect(301, `/vaults/address/${address.toLowerCase()}`);
	}
	redirect(301, `/vaults/${params.vault}`);
}

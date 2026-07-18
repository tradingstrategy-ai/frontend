import { redirect } from '@sveltejs/kit';

/** Redirect the legacy API-key registration URL to its new location. */
export function load({ url }) {
	redirect(301, `/vaults/api/register${url.search}`);
}

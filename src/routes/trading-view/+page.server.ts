import { redirect } from '@sveltejs/kit';

/** Redirect the legacy trading-view landing page to the vault rankings. */
export function load({ url }) {
	redirect(301, `/vaults${url.search}`);
}

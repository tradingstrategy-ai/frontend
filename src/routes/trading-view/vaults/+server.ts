import { redirect } from '@sveltejs/kit';

/** Permanently redirect the legacy vaults index to its canonical URL. */
export function GET({ url }) {
	redirect(301, `/vaults${url.search}`);
}

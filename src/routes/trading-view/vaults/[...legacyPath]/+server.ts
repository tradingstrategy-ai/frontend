import { redirect } from '@sveltejs/kit';

/** Permanently redirect every legacy vault route, including data endpoints. */
export function GET({ params, url }) {
	redirect(301, `/vaults/${params.legacyPath}${url.search}`);
}

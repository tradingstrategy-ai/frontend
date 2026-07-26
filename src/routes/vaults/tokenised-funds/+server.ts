import { redirect } from '@sveltejs/kit';

/** Permanently redirect the legacy tokenised funds route to its canonical URL. */
export function GET({ url }) {
	redirect(301, `/vaults/funds${url.search}`);
}

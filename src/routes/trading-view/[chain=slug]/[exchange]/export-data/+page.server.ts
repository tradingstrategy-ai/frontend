import { redirect } from '@sveltejs/kit';

/**
 * Excel export has been disabled; redirect legacy links to the exchange page.
 */
export function load({ params }) {
	redirect(308, `/trading-view/${params.chain}/${params.exchange}`);
}

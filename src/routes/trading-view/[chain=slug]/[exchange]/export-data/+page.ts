import { load as loadExchange } from '../+page';

/**
 * Reuse the exchange page data; the export page is a download utility rather than a
 * search target, so it is never indexed.
 */
export async function load(event: Parameters<typeof loadExchange>[0]) {
	return {
		...(await loadExchange(event)),
		robots: 'noindex,follow'
	};
}

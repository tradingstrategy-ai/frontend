/**
 * Serve the prepared, role-specific strategies page snapshot.
 *
 * Do not add HTTP caching: the rendered response still depends on admin role
 * and the strategies layout's IP-country behaviour.
 */
import { getStrategiesPageData } from '$lib/strategies/page-cache.server';

export async function load({ fetch, locals }) {
	return getStrategiesPageData(fetch, Boolean(locals.admin));
}

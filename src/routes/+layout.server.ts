import { strategyMicrosite } from '$lib/config';
import { error, redirect } from '@sveltejs/kit';

export async function load({ locals, route }) {
	// restrict routes on custom strategy site
	if (strategyMicrosite) {
		restrictMicrositeRoutes(route.id!, strategyMicrosite);
	}

	// Make admin, ipCountry and announcementDismissedAt available to all layouts/pages
	const { admin, ipCountry, announcementDismissedAt } = locals;
	return { admin, ipCountry, announcementDismissedAt };
}

function restrictMicrositeRoutes(routeId: string, strategyId: string) {
	// redirect home page to strategy page
	if (routeId === '/') redirect(302, `/strategies/${strategyId}`);

	// return 404 for all pages other than strategies, glossary and diagnostics
	const segments = routeId.split('/').slice(1);
	if (!['strategies', 'glossary', 'diagnostics'].includes(segments[0])) {
		error(404, 'Not found');
	}
}

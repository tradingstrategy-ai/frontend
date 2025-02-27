import { strategyMicrosite } from '$lib/config';
import { error, redirect } from '@sveltejs/kit';

const ONE_YEAR = 365 * 24 * 60 * 60;

export async function load({ locals, route, url, cookies }) {
	// restrict routes on custom strategy site
	if (strategyMicrosite) {
		restrictMicrositeRoutes(route.id!, strategyMicrosite);
	}

	// set (or delete) pw cookie if pw URL param present
	const pw = url.searchParams.get('pw');
	if (pw !== null) {
		cookies.set('pw', pw, {
			path: '/',
			maxAge: pw ? ONE_YEAR : 0
		});
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

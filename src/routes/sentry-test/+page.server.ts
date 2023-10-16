export async function load({ url }) {
	if (url.searchParams.has('server')) {
		throw new Error('Sentry test error - server');
	}
}

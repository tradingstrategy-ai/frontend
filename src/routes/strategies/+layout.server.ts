import { assertNotGeoBlocked } from '$lib/helpers/geo';

export async function load({ locals, url }) {
	const { admin, ipCountry } = locals;
	assertNotGeoBlocked('strategies:view', ipCountry, admin);

	// URL param to demo the geo-block feature, e.g.:
	// https://tradingstrategy.ai/strategies?geoBlockDemo=RU
	const demoIpCountry = url.searchParams.get('geoBlockDemo');
	if (demoIpCountry) {
		assertNotGeoBlocked('strategies:view', demoIpCountry);
	}
}

import { assertNotGeoBlocked } from '$lib/helpers/geo';

export async function load({ locals }) {
	const { admin, ipCountry } = locals;
	assertNotGeoBlocked('strategies:view', ipCountry, admin);
}

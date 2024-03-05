import { error } from '@sveltejs/kit';
import { isGeoBlocked, getCountryName } from '$lib/helpers/geo';

export async function load({ locals }) {
	const { admin, ipCountry } = locals;
	const geoBlocked = !admin && isGeoBlocked('strategies:view', ipCountry);

	if (geoBlocked) {
		throw error(451, `Unavailable in ${getCountryName(ipCountry)}`);
	}
}

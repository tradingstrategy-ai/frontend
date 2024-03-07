export async function load({ locals }) {
	// Make admin and ipCountry available to all layouts/pages
	const { admin, ipCountry } = locals;
	return { admin, ipCountry };
}

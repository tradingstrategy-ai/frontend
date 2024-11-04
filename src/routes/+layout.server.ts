// Make admin, ipCountry and announcementDismissedAt available to all layouts/pages
export async function load({ locals }) {
	const { admin, ipCountry, announcementDismissedAt } = locals;
	return { admin, ipCountry, announcementDismissedAt };
}

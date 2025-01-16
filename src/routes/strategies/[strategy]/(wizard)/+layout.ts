export const ssr = false;

export async function load() {
	return {
		skipNavbar: true,
		skipFooter: true,
		skipSideNav: true,
		skipBreadcrumbs: true
	};
}

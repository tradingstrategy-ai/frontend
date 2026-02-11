export const ssr = false;

export async function load({ parent }) {
	const { topVaults } = await parent();
	return { topVaults };
}

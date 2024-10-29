import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { admin } = await parent();

	if (!admin) {
		error(404, 'Not found');
	}
}

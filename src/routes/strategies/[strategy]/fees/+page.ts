import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { vault } = await parent();

	if (!vault.depositEnabled()) {
		error(404, 'Not found');
	}

	return {
		vault, // type-narrowed vault
		fees: await vault.getFees()
	};
}

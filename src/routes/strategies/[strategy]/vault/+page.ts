import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { vault } = await parent();

	if (!vault.depositEnabled()) {
		error(404, 'Not found');
	}

	// re-return type-narrowed vault
	return { vault };
}

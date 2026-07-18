import { redirect } from '@sveltejs/kit';

export function load({ params }) {
	redirect(301, `/vaults/chains/${params.chain}`);
}

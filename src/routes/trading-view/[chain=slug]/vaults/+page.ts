import { redirect } from '@sveltejs/kit';

export function load({ params }) {
	redirect(301, `/trading-view/vaults/chains/${params.chain}`);
}

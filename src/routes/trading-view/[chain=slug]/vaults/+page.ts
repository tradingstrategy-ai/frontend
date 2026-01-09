import { resolve } from '$app/paths';
import { redirect } from '@sveltejs/kit';

export function load({ params }) {
	redirect(301, resolve('/trading-view/vaults/chains/[chain]', params));
}

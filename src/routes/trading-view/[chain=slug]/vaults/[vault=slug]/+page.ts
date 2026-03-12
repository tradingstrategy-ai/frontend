import { redirect } from '@sveltejs/kit';

// Redirect to new vault details route
export function load({ params }) {
	redirect(301, `/trading-view/vaults/${params.vault}`);
}

import { redirect } from '@sveltejs/kit';

// redirect to chain/lending index for now
export async function load({ params }) {
	throw redirect(307, `/trading-view/${params.chain}/lending`);
}

import { redirect } from '@sveltejs/kit';

// redirect to chain/lending index for now
export async function load({ params }) {
	redirect(307, `/trading-view/${params.chain}/lending`);
}

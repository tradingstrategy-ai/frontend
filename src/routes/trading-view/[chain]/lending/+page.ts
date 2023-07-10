import { redirect } from '@sveltejs/kit';

// redirect to global lending-reserves index for now
export async function load() {
	throw redirect(307, '/trading-view/lending-reserves');
}

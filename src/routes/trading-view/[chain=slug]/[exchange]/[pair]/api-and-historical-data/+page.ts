import { redirect } from '@sveltejs/kit';
import { backendUrl } from '$lib/config';

export async function load() {
	redirect(301, `${backendUrl}/explorer/#/Trading%20pair`);
}

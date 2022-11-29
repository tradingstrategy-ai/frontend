import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load: PageLoad = () => {
	throw redirect(301, '/strategies');
};

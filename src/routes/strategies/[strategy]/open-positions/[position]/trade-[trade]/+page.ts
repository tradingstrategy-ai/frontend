import type { PageLoad } from './$types';
import { redirect } from '@sveltejs/kit';

// FIXME: remove this once the new trade detail page is in place
// (temporary redirect to keep navigation working while migration is in-progress)
export const load: PageLoad = ({ params }) => {
	throw redirect(301, `/strategy/${params.strategy}/open-positions/${params.position}/trade-${params.trade}`);
};

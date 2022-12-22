import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent }) => {
	const { position: id, status } = params;
	const { state } = await parent();

	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const position = state.portfolio[`${status}_positions`][id];

	if (!position) {
		throw error(404, 'Not found');
	}

	return {
		position,
		status,
		breadcrumbs: { [id]: `Position #${id}` }
	};
};

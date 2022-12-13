import type { LayoutLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: LayoutLoad = async ({ params, parent }) => {
	const positionId = params.position;
	const { state } = await parent();
	const position = state.portfolio.open_positions[positionId];

	if (!position) {
		throw error(404, 'Not found');
	}

	return {
		position,
		breadcrumbs: { [positionId]: `Position #${positionId}` }
	};
};

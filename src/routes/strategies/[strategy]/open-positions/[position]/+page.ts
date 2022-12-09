import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
	const positionId = Number.parseInt(params.position);
	const data = await parent();
	const position = data.state.portfolio.open_positions[positionId];

	if (!position) {
		throw error(404, 'Not found');
	}

	return { position };
};

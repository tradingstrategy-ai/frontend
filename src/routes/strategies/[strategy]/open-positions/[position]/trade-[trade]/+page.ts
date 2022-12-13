import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageLoad = async ({ params, parent }) => {
	const tradeId = params.trade;
	const { breadcrumbs, position } = await parent();
	const trade = position.trades[tradeId];

	if (!trade) {
		throw error(404, 'Not found');
	}

	return {
		trade,
		breadcrumbs: {
			...breadcrumbs,
			[`trade-${tradeId}`]: `Trade #${tradeId}`
		}
	};
};

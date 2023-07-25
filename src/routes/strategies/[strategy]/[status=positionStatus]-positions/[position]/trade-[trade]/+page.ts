import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const tradeId = params.trade;
	const { breadcrumbs, position, chain } = await parent();
	const trade = position.trades[tradeId];

	if (!trade) {
		throw error(404, 'Not found');
	}

	return {
		trade,
		chain,
		breadcrumbs: {
			...breadcrumbs,
			[`trade-${tradeId}`]: `Trade #${tradeId}`
		}
	};
}

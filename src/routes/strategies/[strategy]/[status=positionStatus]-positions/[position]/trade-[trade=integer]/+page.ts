import { error } from '@sveltejs/kit';
import { createTradeInfo } from 'trade-executor/state/trade-info.js';

export async function load({ params, parent }) {
	const tradeId = params.trade;
	const { breadcrumbs, position } = await parent();

	const trade = createTradeInfo(position.trades[tradeId]);

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
}

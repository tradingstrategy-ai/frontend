import { error } from '@sveltejs/kit';

export async function load({ params, parent }) {
	const tradeId = Number(params.trade);
	const { breadcrumbs, position } = await parent();

	const trade = position.trades.find((t) => t.trade_id === tradeId);

	if (!trade) {
		error(404, 'Not found');
	}

	return {
		trade,
		breadcrumbs: {
			...breadcrumbs,
			[`trade-${tradeId}`]: `Trade #${tradeId}`
		}
	};
}

import type { PageLoad } from './$types';

export const load: PageLoad = ({ params }) => {
	return {
		positionId: params.position_id,
		tradeId: params.trade_id
	};
};

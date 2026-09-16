import { defineMock } from 'vite-plugin-mock-dev-server';
import pairDetails from './detail.data.json' with { type: 'json' };
import { ILLIQUID_PAIR_SLUG } from './fixtures';

const illiquidPair = {
	...pairDetails.body,
	summary: {
		...pairDetails.body.summary,
		pair_id: 999_999,
		pair_slug: ILLIQUID_PAIR_SLUG,
		pair_symbol: 'DEAD-ETH',
		pair_name: 'Dead Token-Ether',
		base_token_symbol: 'DEAD',
		base_token_symbol_friendly: 'DEAD',
		pair_tvl: 0.016,
		usd_liquidity_latest: null,
		usd_volume_24h: 0,
		usd_volume_30d: 0
	}
};

export default defineMock({
	url: pairDetails.url,
	body: ({ query }) => (query.pair_slug === ILLIQUID_PAIR_SLUG ? illiquidPair : pairDetails.body)
});

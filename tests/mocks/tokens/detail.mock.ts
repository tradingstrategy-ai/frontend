import { defineMock } from 'vite-plugin-mock-dev-server';
import tokenDetails from './detail.data.json' with { type: 'json' };
import { ILLIQUID_TOKEN_ADDRESS } from './fixtures';

const illiquidToken = {
	...tokenDetails.body,
	name: 'Dead Token',
	symbol: 'DEAD',
	token_id: 999_999,
	address: ILLIQUID_TOKEN_ADDRESS,
	liquidity_latest: 0.97,
	tvl_latest: 0.97,
	volume_24h: 0,
	pair_count: 1,
	explorer_link: `https://etherscan.io/address/${ILLIQUID_TOKEN_ADDRESS}`
};

export default defineMock({
	url: tokenDetails.url,
	body: ({ query }) => (query.address === ILLIQUID_TOKEN_ADDRESS ? illiquidToken : tokenDetails.body)
});

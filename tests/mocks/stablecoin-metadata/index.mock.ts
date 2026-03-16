import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
import { defineMock } from 'vite-plugin-mock-dev-server';

export const mockStablecoins: StablecoinMetadata[] = [
	{
		symbol: 'USDC',
		slug: 'usdc',
		name: 'USD Coin (Circle)',
		description:
			'USD Coin (USDC) is a fully-reserved USD stablecoin issued by Circle, backed by cash and short-dated US government obligations.',
		category: 'stablecoin',
		links: {
			homepage: 'https://www.circle.com/usdc',
			coingecko: 'https://www.coingecko.com/en/coins/usd-coin',
			defillama: 'https://defillama.com/stablecoin/usd-coin',
			twitter: 'https://x.com/circle'
		},
		logos: {
			light: 'http://localhost:4173/api/stablecoin-metadata/usdc/light.png'
		}
	},
	{
		symbol: 'USDT',
		slug: 'usdt',
		name: 'Tether USD',
		description: 'Tether (USDT) is the largest stablecoin by market capitalisation, pegged 1:1 to the US Dollar.',
		category: 'stablecoin',
		links: {
			homepage: 'https://tether.to/',
			coingecko: 'https://www.coingecko.com/en/coins/tether',
			defillama: 'https://defillama.com/stablecoin/tether',
			twitter: 'https://x.com/Tether_to'
		},
		logos: {
			light: 'http://localhost:4173/api/stablecoin-metadata/usdt/light.png'
		}
	},
	{
		symbol: 'DAI',
		slug: 'dai',
		name: 'Dai Stablecoin',
		description: 'Dai is a decentralised stablecoin soft-pegged to the US Dollar, generated through MakerDAO.',
		category: 'stablecoin',
		links: {
			homepage: 'https://makerdao.com/',
			coingecko: 'https://www.coingecko.com/en/coins/dai',
			defillama: 'https://defillama.com/stablecoin/dai',
			twitter: 'https://x.com/MakerDAO'
		},
		logos: {
			light: 'http://localhost:4173/api/stablecoin-metadata/dai/light.png'
		}
	},
	{
		symbol: 'FRAX',
		slug: 'frax',
		name: 'Frax',
		description: 'Frax is a fractional-algorithmic stablecoin.',
		category: 'stablecoin',
		links: {
			homepage: 'https://frax.finance/',
			coingecko: 'https://www.coingecko.com/en/coins/frax',
			defillama: null,
			twitter: 'https://x.com/fraboratory'
		},
		logos: {
			light: 'http://localhost:4173/api/stablecoin-metadata/frax/light.png'
		}
	}
];

export default defineMock({
	url: '/api/stablecoin-metadata/index.json',
	body: mockStablecoins
});

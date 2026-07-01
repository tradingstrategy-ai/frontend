import type { StablecoinMetadata } from '$lib/stablecoin-metadata/schemas';
import { defineMock } from 'vite-plugin-mock-dev-server';

export const mockStablecoins: StablecoinMetadata[] = [
	{
		symbol: 'USDC',
		slug: 'usdc',
		name: 'USD Coin (Circle)',
		short_description:
			'USD Coin (USDC) is a fully-reserved USD stablecoin issued by Circle, backed by cash and short-dated US government obligations.',
		long_description:
			'USD Coin (USDC) is a fully-reserved USD stablecoin issued by Circle.\n\n## Issuance and reserves\n\nEach USDC token is backed 1:1 by cash and short-dated US government obligations held at regulated US financial institutions.',
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
		},
		coingecko_id: 'usd-coin',
		coingecko_link: 'https://www.coingecko.com/en/coins/usd-coin',
		coingecko_id_source: 'url',
		coingecko_id_verified_at: '2026-06-26T12:16:16',
		usd_rate: 0.999667,
		usd_rate_fetched_at: '2026-06-26T12:16:16',
		usd_rate_updated_at: '2026-06-26T12:15:26',
		peg_rate: 0.999667,
		peg_rate_currency: 'usd',
		rate_fetch_failed_at: null,
		rate_fetch_failed_reason: null,
		depegged_at: null
	},
	{
		symbol: 'USDT',
		slug: 'usdt',
		name: 'Tether USD',
		short_description: 'Tether (USDT) is the largest stablecoin by market capitalisation, pegged 1:1 to the US Dollar.',
		long_description:
			'Tether (USDT) is the largest stablecoin by market capitalisation.\n\n## Reserves\n\nUSDT is issued by Tether Limited and backed by reserves including cash, cash equivalents, and other assets.',
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
		},
		coingecko_id: 'tether',
		coingecko_link: 'https://www.coingecko.com/en/coins/tether',
		coingecko_id_source: 'url',
		coingecko_id_verified_at: '2026-06-26T12:16:16',
		usd_rate: 0.998536,
		usd_rate_fetched_at: '2026-06-26T12:16:16',
		usd_rate_updated_at: '2026-06-26T12:15:26',
		peg_rate: 0.998536,
		peg_rate_currency: 'usd',
		rate_fetch_failed_at: null,
		rate_fetch_failed_reason: null,
		depegged_at: null
	},
	{
		symbol: 'DAI',
		slug: 'dai',
		name: 'Dai Stablecoin',
		short_description: 'Dai is a decentralised stablecoin soft-pegged to the US Dollar, generated through MakerDAO.',
		long_description:
			'Dai is a decentralised stablecoin soft-pegged to the US Dollar.\n\n## Mechanism\n\nDai is generated through MakerDAO by depositing collateral into Maker Vaults. It is overcollateralised by various crypto assets.',
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
		},
		coingecko_id: 'dai',
		coingecko_link: 'https://www.coingecko.com/en/coins/dai',
		coingecko_id_source: 'url',
		coingecko_id_verified_at: '2026-06-26T12:16:16',
		usd_rate: 0.999703,
		usd_rate_fetched_at: '2026-06-26T12:16:16',
		usd_rate_updated_at: '2026-06-26T12:15:26',
		peg_rate: 0.999703,
		peg_rate_currency: 'usd',
		rate_fetch_failed_at: null,
		rate_fetch_failed_reason: null,
		depegged_at: null
	},
	{
		symbol: 'EURA',
		slug: 'eura',
		name: 'Angle EURA',
		short_description: 'EURA is a Euro stablecoin issued by Angle.',
		description: 'EURA is a Euro stablecoin issued by Angle.',
		category: 'stablecoin',
		links: {
			homepage: 'https://www.angle.money/',
			coingecko: 'https://www.coingecko.com/en/coins/ageur',
			defillama: null,
			twitter: 'https://x.com/AngleProtocol'
		},
		logos: {
			light: 'http://localhost:4173/api/stablecoin-metadata/eura/light.png'
		},
		coingecko_id: 'ageur',
		coingecko_link: 'https://www.coingecko.com/en/coins/ageur',
		coingecko_id_source: 'url',
		coingecko_id_verified_at: '2026-06-26T12:16:16',
		usd_rate: 1.14,
		usd_rate_fetched_at: '2026-06-26T12:16:16',
		usd_rate_updated_at: '2026-06-26T12:15:11',
		peg_rate: 0.996731,
		peg_rate_currency: 'eur',
		rate_fetch_failed_at: null,
		rate_fetch_failed_reason: null,
		depegged_at: null
	},
	{
		symbol: 'FRAX',
		slug: 'frax',
		name: 'Frax',
		short_description: 'Frax is a fractional-algorithmic stablecoin.',
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
		},
		coingecko_id: 'frax',
		coingecko_link: 'https://www.coingecko.com/en/coins/frax',
		coingecko_id_source: 'url',
		coingecko_id_verified_at: '2026-06-26T12:16:16',
		usd_rate: 0.82,
		usd_rate_fetched_at: '2026-06-26T12:16:16',
		usd_rate_updated_at: '2026-06-26T12:15:26',
		peg_rate: 0.82,
		peg_rate_currency: 'usd',
		rate_fetch_failed_at: null,
		rate_fetch_failed_reason: null,
		depegged_at: '2026-06-26T12:15:26'
	}
];

export default defineMock({
	url: '/api/stablecoin-metadata/index.json',
	body: mockStablecoins
});

import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock({
	url: '/api/vault-protocols/gmx/metadata.json',
	body: {
		name: 'GMX',
		slug: 'gmx',
		short_description: 'A decentralised exchange with liquidity pools for perpetual markets.',
		long_description: 'GMX liquidity pools provide the counterparty liquidity for perpetual markets.',
		links: {
			homepage: 'https://gmx.io',
			twitter: 'https://x.com/GMX_IO',
			documentation: 'https://docs.gmx.io',
			github: 'https://github.com/gmx-io',
			defillama: 'https://defillama.com/protocol/gmx',
			audits: null
		},
		logos: { light: null, dark: null }
	}
});

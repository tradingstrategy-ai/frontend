import { defineMock } from 'vite-plugin-mock-dev-server';

export default defineMock({
	url: '/api/vault-protocols/yearn/metadata.json',
	body: {
		name: 'Yearn',
		slug: 'yearn',
		short_description: 'Automated yield-generating vaults.',
		long_description: 'Yearn vaults automate yield-generating strategies.',
		links: {
			homepage: 'https://yearn.fi',
			twitter: 'https://x.com/yearnfi',
			documentation: 'https://docs.yearn.fi',
			github: 'https://github.com/yearn',
			defillama: 'https://defillama.com/protocol/yearn-finance',
			audits: null
		},
		logos: {
			light: 'http://localhost:4173/api/vault-protocols/yearn/light.png',
			dark: null
		}
	}
});

import { defineMock } from 'vite-plugin-mock-dev-server';
import { mockStablecoins } from './index.mock';

export default defineMock({
	url: '/api/stablecoin-metadata/:slug/metadata.json',
	body: (request) => {
		const slug = request.params.slug;
		const match = mockStablecoins.find((s) => s.slug === slug);
		if (!match) return [];
		return [match];
	}
});

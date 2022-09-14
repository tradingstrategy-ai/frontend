import type { RequestHandler } from './$types';
import template from './template.ipynb?raw';

export const GET: RequestHandler = async ({ params }) => {
	const headers = {
		'Content-Type': 'application/x-ipynb+json'
	};
	return new Response(render(params), { headers });
};

function render({ chain, exchange, pair }: any) {
	return template
		.replace(/%chain_slug%/g, chain)
		.replace(/%exchange_slug%/g, exchange)
		.replace(/%pair_slug%/g, pair);
}

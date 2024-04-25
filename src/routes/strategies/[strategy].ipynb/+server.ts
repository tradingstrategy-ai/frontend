import { error, text } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/public-api';
import { configuredStrategies } from 'trade-executor/strategy/configuration';

export async function GET({ fetch, params }) {
	const strategy = configuredStrategies.get(params.strategy);
	if (!strategy) throw error(404, 'Not found');

	const resp = await fetch(`${strategy.url}/file?type=notebook`);

	if (!resp.ok) throw await publicApiError(resp);

	const headers = new Headers({
		'content-type': 'application/x-ipynb+json',
		'content-disposition': `attachment; filename="${params.strategy}.ipynb"`,
		'cache-control': 'public, max-age=1800' // 30 minutes: 30 * 60 = 1800
	});

	if (resp.headers.has('last-modified')) {
		headers.set('last-modified', resp.headers.get('last-modified')!);
	}

	return text(await resp.text(), { headers });
}

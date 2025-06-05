import { error, json } from '@sveltejs/kit';
import { getStrategyInfo } from 'trade-executor/client/strategy-info.js';
import { configuredStrategies } from 'trade-executor/schemas/configuration';

export async function GET({ fetch, params }) {
	const strategyConf = configuredStrategies.get(params.strategy);
	if (!strategyConf) error(404, 'Not found');

	const strategy = await getStrategyInfo(fetch, strategyConf);

	return json({
		id: strategy.id,
		name: strategy.name,
		short_description: strategy.short_description,
		url: strategy.url
	});
}

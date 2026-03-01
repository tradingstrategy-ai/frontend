import type { PositionStatus } from 'trade-executor/schemas/position.js';
import { error, json } from '@sveltejs/kit';
import { configuredStrategies } from 'trade-executor/schemas/configuration';
import { getStrategyState } from 'trade-executor/client/state.js';
import { type TradingPositionInfo, getTradingPositionInfoArray } from 'trade-executor/models/position-info';
import { getDateParam, getStringParam } from '$lib/helpers/url-params';

export async function GET({ fetch, params, url }) {
	const { strategy, status } = params;
	const { searchParams } = url;

	const strategyConf = configuredStrategies.get(strategy);
	if (!strategyConf) error(404, 'Not found');

	const state = await getStrategyState(fetch, strategy);
	const positions = getTradingPositionInfoArray(state, status);

	const filtered = filterPositions(positions, searchParams, status);
	const sorted = sortPositions(filtered, searchParams);

	return json(sorted);
}

function filterPositions(positions: TradingPositionInfo[], searchParams: URLSearchParams, status: PositionStatus) {
	const start = getDateParam(searchParams, 'start');
	const end = getDateParam(searchParams, 'end');

	if (!(start || end)) return positions;

	// filter based on date field corresponding to the position status (open, closed, frozen)
	const dateField = (
		{
			open: 'opened_at',
			closed: 'closed_at',
			frozen: 'frozen_at'
		} as const
	)[status];

	return positions.filter((p) => {
		const positionDate = p[dateField];
		return positionDate && positionDate >= (start ?? 0) && positionDate < (end ?? Infinity);
	});
}

function sortPositions(positions: TradingPositionInfo[], searchParams: URLSearchParams) {
	const sort = getStringParam(searchParams, 'sort', [
		'position_id',
		'opened_at',
		'closed_at',
		'profitability'
	] as const);
	const direction = getStringParam(searchParams, 'direction', ['asc', 'desc'] as const);
	const sign = direction === 'asc' ? 1 : -1;
	return positions.toSorted((a, b) => ((a[sort]?.valueOf() ?? 0) - (b[sort]?.valueOf() ?? 0)) * sign);
}

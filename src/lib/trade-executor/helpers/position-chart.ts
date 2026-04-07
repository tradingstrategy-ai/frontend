import { isNumber } from '$lib/helpers/formatters';
import type { PositionChart } from '../schemas/position-chart';
import { TradeDirections, type TradeInfo } from '../models/trade-info';

export type PositionChartPoint = {
	timestamp: number;
	value: number;
};

export type PositionChartMarkerKind = 'increase' | 'decrease';

export type PositionChartMarker = {
	timestamp: number;
	value: number;
	kind: PositionChartMarkerKind;
	tradeId: number;
	directionLabel: string;
	happenedAt: Date;
	price: number | null;
	quantity: number | null;
	tradeValueUsd: number;
	tradeUrl: string;
};

export type PositionChartSeries = {
	points: PositionChartPoint[];
	markers: PositionChartMarker[];
	unavailableMessage: string | null;
};

export type PositionChartsModel = {
	underlyingPrice: PositionChartSeries;
	internalSharePrice: PositionChartSeries;
	warnings: string[];
};

export function buildPositionChartsModel(payload: PositionChart, tradePathBase = '.'): PositionChartsModel {
	const trades = getMarkerTrades(payload.trades, tradePathBase);
	const underlyingPricePoints = buildUnderlyingPricePoints(payload);
	const internalSharePricePoints = normalisePoints(
		payload.position_statistics.flatMap((sample) =>
			isNumber(sample.internal_share_price)
				? [{ timestamp: sample.calculated_at.getTime(), value: sample.internal_share_price }]
				: []
		)
	);

	return {
		underlyingPrice: {
			points: underlyingPricePoints,
			markers: buildMarkers(underlyingPricePoints, trades),
			unavailableMessage:
				underlyingPricePoints.length > 0
					? null
					: (payload.price_history_status_message ?? 'Underlying price history is not available for this position.')
		},
		internalSharePrice: {
			points: internalSharePricePoints,
			markers: buildMarkers(internalSharePricePoints, trades),
			unavailableMessage:
				internalSharePricePoints.length > 0 ? null : 'Internal share-price history is not available for this position.'
		},
		warnings: payload.warnings
	};
}

function buildUnderlyingPricePoints(payload: PositionChart): PositionChartPoint[] {
	if (payload.price_history.length > 0) {
		return normalisePoints(
			payload.price_history.flatMap(([timestamp, value]) =>
				isNumber(value) ? [{ timestamp: timestamp * 1000, value }] : []
			)
		);
	}

	return normalisePoints(
		payload.position_statistics.flatMap((sample) =>
			isNumber(sample.underlying_price)
				? [{ timestamp: sample.calculated_at.getTime(), value: sample.underlying_price }]
				: []
		)
	);
}

function normalisePoints(points: PositionChartPoint[]) {
	const deduped = new Map<number, PositionChartPoint>();

	for (const point of points) {
		if (!isNumber(point.value)) continue;
		deduped.set(point.timestamp, point);
	}

	return [...deduped.values()].sort((a, b) => a.timestamp - b.timestamp);
}

function getMarkerTrades(trades: TradeInfo[], tradePathBase: string) {
	return trades
		.filter((trade) => !trade.repaired_at)
		.filter((trade) => {
			const plannedQuantity = trade.planned_quantity;
			const executedQuantity = trade.executed_quantity ?? 0;
			return plannedQuantity !== 0 || executedQuantity !== 0;
		})
		.flatMap((trade) => {
			const timestamp = getTradeTimestamp(trade);
			if (!timestamp) return [];
			if (trade.direction === TradeDirections.Unknown) return [];

			return [
				{
					trade,
					timestamp,
					kind: trade.direction === TradeDirections.Enter ? ('increase' as const) : ('decrease' as const),
					directionLabel: trade.direction === TradeDirections.Enter ? 'Increase' : 'Decrease',
					quantity: trade.executed_quantity ?? trade.planned_quantity ?? null,
					price: trade.executed_price ?? null,
					tradeValueUsd: trade.value,
					tradeUrl: `${tradePathBase}/trade-${trade.trade_id}`
				}
			];
		});
}

function buildMarkers(points: PositionChartPoint[], trades: ReturnType<typeof getMarkerTrades>): PositionChartMarker[] {
	if (points.length === 0) return [];

	return trades.flatMap((item) => {
		const nearestPoint = getNearestPoint(points, item.timestamp * 1000);
		if (!nearestPoint) return [];

		return [
			{
				timestamp: nearestPoint.timestamp,
				value: nearestPoint.value,
				kind: item.kind,
				tradeId: item.trade.trade_id,
				directionLabel: item.directionLabel,
				happenedAt: new Date(item.timestamp * 1000),
				price: item.price,
				quantity: item.quantity,
				tradeValueUsd: item.tradeValueUsd,
				tradeUrl: item.tradeUrl
			}
		];
	});
}

function getNearestPoint(points: PositionChartPoint[], timestamp: number) {
	let nearestPoint = points[0];
	let nearestDistance = Math.abs(points[0].timestamp - timestamp);

	for (const point of points.slice(1)) {
		const distance = Math.abs(point.timestamp - timestamp);
		if (distance < nearestDistance) {
			nearestPoint = point;
			nearestDistance = distance;
		}
	}

	return nearestPoint;
}

function getTradeTimestamp(trade: TradeInfo) {
	return trade.executed_at ?? trade.failed_at ?? trade.started_at ?? trade.opened_at ?? null;
}

import { describe, expect, test } from 'vitest';
import { buildPositionChartsModel } from './position-chart';
import { positionChartSchema } from '../schemas/position-chart';

const BASE_TS = 1735689600;

const vaultPair = {
	base: {
		chain_id: 1,
		address: '0x0000000000000000000000000000000000000001',
		token_symbol: 'gmUSDC',
		decimals: 6
	},
	quote: {
		chain_id: 1,
		address: '0x0000000000000000000000000000000000000002',
		token_symbol: 'USDC',
		decimals: 6
	},
	pool_address: '0x0000000000000000000000000000000000000010',
	exchange_address: null,
	internal_id: 1,
	internal_exchange_id: 1,
	info_url: 'https://tradingstrategy.ai/trading-view/ethereum/mock/gmusdc',
	fee: 0,
	reverse_token_order: true,
	kind: 'vault',
	underlying_spot_pair: null,
	exchange_name: 'mock-exchange',
	other_data: { vault_name: 'Mock vault' }
} as const;

const reserveCurrency = {
	chain_id: 1,
	address: '0x0000000000000000000000000000000000000002',
	token_symbol: 'USDC',
	decimals: 6,
	internal_id: null,
	info_url: null,
	underlying: null,
	type: 'token',
	liquidation_threshold: null
} as const;

function createTrade(overrides: Record<string, unknown> = {}) {
	return {
		trade_id: 1,
		position_id: 1,
		trade_type: 'rebalance',
		pair: vaultPair,
		opened_at: BASE_TS,
		planned_quantity: '10',
		planned_reserve: '10',
		planned_price: 1,
		reserve_currency: reserveCurrency,
		flags: ['increase', 'open'],
		started_at: BASE_TS + 60,
		executed_at: BASE_TS + 120,
		failed_at: null,
		executed_price: 1.05,
		executed_quantity: '10',
		blockchain_transactions: [],
		repaired_at: null,
		repaired_trade_id: null,
		...overrides
	};
}

function createStatSample(offsetSeconds: number, overrides: Record<string, unknown> = {}) {
	return {
		calculated_at: BASE_TS + offsetSeconds,
		last_valuation_at: BASE_TS + offsetSeconds,
		profitability: 0,
		profit_usd: 0,
		quantity: 1,
		value: 1,
		internal_share_price: null,
		internal_total_supply: null,
		internal_profit_pct: null,
		internal_profit_usd: null,
		underlying_price: null,
		...overrides
	};
}

function createPayload(overrides: Record<string, unknown> = {}) {
	return positionChartSchema.parse({
		position_number: 1,
		price_history: [
			[BASE_TS, 1],
			[BASE_TS + 3600, 1.1],
			[BASE_TS + 7200, 1.2]
		],
		price_history_status_message: 'Historical price data is available.',
		position_statistics: [
			createStatSample(0, { internal_share_price: 1.0 }),
			createStatSample(3600, { internal_share_price: 1.02 }),
			createStatSample(7200, { internal_share_price: 1.03 })
		],
		trades: [createTrade()],
		warnings: [],
		...overrides
	});
}

describe('buildPositionChartsModel', () => {
	test('creates markers from increase and decrease trades even without flags', () => {
		const payload = createPayload({
			trades: [
				createTrade({
					trade_id: 1,
					planned_quantity: '10',
					executed_quantity: '10',
					executed_at: BASE_TS + 120,
					flags: ['increase', 'open']
				}),
				createTrade({
					trade_id: 2,
					planned_quantity: '-4',
					executed_quantity: '-4',
					executed_at: BASE_TS + 4000,
					executed_price: 1.12,
					flags: []
				})
			]
		});

		const model = buildPositionChartsModel(payload);

		expect(model.underlyingPrice.markers).toHaveLength(2);
		expect(model.underlyingPrice.markers.map((marker) => marker.kind)).toEqual(['increase', 'decrease']);
		expect(model.underlyingPrice.markers.map((marker) => marker.timestamp)).toEqual([
			BASE_TS * 1000,
			(BASE_TS + 3600) * 1000
		]);
		expect(model.internalSharePrice.markers).toHaveLength(2);
	});

	test('excludes repaired and zero-impact trades from markers', () => {
		const payload = createPayload({
			trades: [
				createTrade({ trade_id: 1 }),
				createTrade({
					trade_id: 2,
					planned_quantity: '-5',
					executed_quantity: '0',
					repaired_at: BASE_TS + 500
				}),
				createTrade({
					trade_id: 3,
					planned_quantity: '0',
					executed_quantity: '0',
					flags: []
				})
			]
		});

		const model = buildPositionChartsModel(payload);

		expect(model.underlyingPrice.markers).toHaveLength(1);
		expect(model.underlyingPrice.markers[0].tradeId).toBe(1);
	});

	test('falls back to underlying_price samples when price_history is missing', () => {
		const payload = createPayload({
			price_history: [],
			position_statistics: [
				createStatSample(0, { underlying_price: 1.2, internal_share_price: 1.01 }),
				createStatSample(3600, { underlying_price: 1.25, internal_share_price: 1.02 }),
				createStatSample(7200, { underlying_price: null, internal_share_price: 1.03 })
			]
		});

		const model = buildPositionChartsModel(payload);

		expect(model.underlyingPrice.points).toEqual([
			{ timestamp: BASE_TS * 1000, value: 1.2 },
			{ timestamp: (BASE_TS + 3600) * 1000, value: 1.25 }
		]);
		expect(model.underlyingPrice.unavailableMessage).toBeNull();
	});

	test('keeps exact price-history status message when underlying chart is unavailable', () => {
		const payload = createPayload({
			price_history: [],
			price_history_status_message:
				'Historical price data is not available because the strategy universe is not loaded in the live executor.',
			position_statistics: [
				createStatSample(0, { internal_share_price: 1.01 }),
				createStatSample(3600, { internal_share_price: 1.02 })
			]
		});

		const model = buildPositionChartsModel(payload);

		expect(model.underlyingPrice.points).toHaveLength(0);
		expect(model.underlyingPrice.unavailableMessage).toBe(
			'Historical price data is not available because the strategy universe is not loaded in the live executor.'
		);
		expect(model.internalSharePrice.points).toHaveLength(2);
	});

	test('shows generic message when internal share-price data is missing', () => {
		const payload = createPayload({
			position_statistics: [createStatSample(0), createStatSample(3600)]
		});

		const model = buildPositionChartsModel(payload);

		expect(model.internalSharePrice.points).toHaveLength(0);
		expect(model.internalSharePrice.unavailableMessage).toBe(
			'Internal share-price history is not available for this position.'
		);
	});
});

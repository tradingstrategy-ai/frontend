import { describe, expect, it } from 'vitest';
import { lagoonSmartContractSchema } from './summary';

const lagoonContracts = {
	address: '0xC723aDd84EE4646044ff28e552808E0a3ac48b54',
	feeReceiver: '0xa8F8DEbb722c6174B814b432169BF569603F673F',
	feeRegistry: '0xd70937AA2B73A8a2100932c4f5a8D32c9bE8b80f',
	valuationManager: '0x005B8d2FF173C8bCc980F275884B1E717082F10C',
	safe: '0xa8F8DEbb722c6174B814b432169BF569603F673F',
	asset: '0xb88339CB7199b77E23DB6E890353E22632Ba630f'
};

describe('lagoonSmartContractSchema', () => {
	it('parses GuardV0 automated settlement policy metadata', () => {
		const result = lagoonSmartContractSchema.parse({
			...lagoonContracts,
			lagoon_guard_v0: {
				daily_automatic_settlement_limit_enabled: true,
				daily_automatic_settlement_limit: '5000',
				settlement_cooldown_seconds: '86400'
			}
		});

		expect(result.lagoon_guard_v0).toEqual({
			automatic_settlement_window_limit_enabled: true,
			automatic_settlement_window_limit: '5000',
			settlement_window_seconds: 86_400
		});
	});

	it('parses the settlement-window GuardV0 policy reported by newer executors', () => {
		const result = lagoonSmartContractSchema.parse({
			...lagoonContracts,
			lagoon_guard_v0: {
				guard_version: 'GuardV0',
				automatic_settlement_window_limit_enabled: true,
				automatic_settlement_window_limit: '5000',
				automatic_settlement_window_limit_raw: 5_000_000_000,
				settlement_window_seconds: 86_400,
				settled_amount_in_window: '20',
				settled_amount_in_window_raw: 20_000_000,
				remaining_automatic_settlement_budget: '4980',
				remaining_automatic_settlement_budget_raw: 4_980_000_000,
				settlement_window_end_timestamp: 1_789_746_983
			}
		});

		expect(result.lagoon_guard_v0).toEqual({
			guard_version: 'GuardV0',
			automatic_settlement_window_limit_enabled: true,
			automatic_settlement_window_limit: '5000',
			settlement_window_seconds: 86_400,
			settled_amount_in_window: '20',
			remaining_automatic_settlement_budget: '4980',
			settlement_window_end_timestamp: 1_789_746_983
		});
	});

	it.each([undefined, null])('allows an absent GuardV0 policy (%s)', (lagoon_guard_v0) => {
		const result = lagoonSmartContractSchema.parse({ ...lagoonContracts, lagoon_guard_v0 });
		expect(result.lagoon_guard_v0).toBe(lagoon_guard_v0);
	});
});

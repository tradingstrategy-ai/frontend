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
			daily_automatic_settlement_limit_enabled: true,
			daily_automatic_settlement_limit: '5000',
			settlement_cooldown_seconds: 86_400
		});
	});

	it.each([undefined, null])('allows an absent GuardV0 policy (%s)', (lagoon_guard_v0) => {
		const result = lagoonSmartContractSchema.parse({ ...lagoonContracts, lagoon_guard_v0 });
		expect(result.lagoon_guard_v0).toBe(lagoon_guard_v0);
	});
});

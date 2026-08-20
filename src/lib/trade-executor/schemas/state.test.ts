import { describe, expect, it } from 'vitest';
import { balanceUpdateSchema } from './balance-update';
import { syncSchema } from './state';

describe('state schemas', () => {
	it('parses pending treasury deposits and redemptions', () => {
		const sync = syncSchema.parse({
			treasury: {
				pending_deposits: '123.45',
				pending_redemptions: 67.89,
				last_block_scanned: 123456
			}
		});

		expect(sync.treasury?.pending_deposits).toBe(123.45);
		expect(sync.treasury?.pending_redemptions).toBe(67.89);
		expect(sync.treasury?.['last_block_scanned']).toBe(123456);
	});

	it('retains Lagoon settlement diagnostics needed for gross-flow reporting', () => {
		const update = balanceUpdateSchema.parse({
			balance_update_id: 1,
			cause: 'deposit_and_redemption',
			position_type: 'reserve',
			asset: {
				chain_id: 1,
				address: '0x0000000000000000000000000000000000000001',
				token_symbol: 'USDC',
				decimals: 6,
				internal_id: 1
			},
			block_mined_at: 1,
			chain_id: 1,
			quantity: '0',
			old_balance: '0',
			usd_value: 0,
			other_data: {
				deposited: '100',
				redeemed: '25',
				settlement_origin: 'executor_broadcast'
			}
		});

		const diagnostics = update.other_data;
		expect(diagnostics?.deposited).toBe('100');
		expect(diagnostics?.redeemed).toBe('25');
		expect(diagnostics?.settlement_origin).toBe('executor_broadcast');
	});
});

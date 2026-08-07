import { describe, expect, it } from 'vitest';
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
});

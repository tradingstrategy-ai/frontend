import { render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { State } from 'trade-executor/schemas/state';
import LagoonGuardV0Flow from './LagoonGuardV0Flow.svelte';

const guard = {
	daily_automatic_settlement_limit_enabled: true,
	daily_automatic_settlement_limit: '5000',
	settlement_cooldown_seconds: 86_400
};

afterEach(() => vi.useRealTimers());

describe('LagoonGuardV0Flow', () => {
	it('displays the daily automated settlement allowance', () => {
		render(LagoonGuardV0Flow, {
			guard,
			treasury: {
				pending_deposits: 1200,
				pending_redemptions: 345.67
			}
		});

		expect(screen.getByRole('heading', { name: 'Deposit and redemption flow' })).toBeInTheDocument();
		expect(screen.getByText('$5,000')).toBeInTheDocument();
		expect(screen.getByText('/24h')).toBeInTheDocument();
		expect(screen.getByText('Pending deposits')).toBeInTheDocument();
		expect(screen.getByText('$1,200')).toBeInTheDocument();
		expect(screen.getByText('Pending redemptions')).toBeInTheDocument();
		expect(screen.getByText('$346')).toBeInTheDocument();
	});

	it('displays pending treasury flow from the strategy state promise', async () => {
		render(LagoonGuardV0Flow, {
			guard,
			treasuryPromise: Promise.resolve({
				pending_deposits: 10_000,
				pending_redemptions: 2500
			})
		});

		expect(await screen.findByText('$10,000')).toBeInTheDocument();
		expect(await screen.findByText('$2,500')).toBeInTheDocument();
	});

	it('displays gross automated flow and the active window reset time from state', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2023-11-15T00:00:00Z'));
		const state = {
			portfolio: {
				reserves: {
					usdc: {
						balance_updates: {
							'1': {
								cause: 'deposit_and_redemption',
								block_mined_at: 1_700_000_000,
								other_data: {
									deposited: '1200',
									redeemed: '300',
									settlement_origin: 'executor_broadcast'
								}
							},
							'2': {
								cause: 'deposit_and_redemption',
								block_mined_at: 1_700_020_000,
								other_data: {
									deposited: '900',
									redeemed: '100',
									settlement_origin: 'discovered_by_scan'
								}
							}
						}
					}
				}
			}
		} as State;

		render(LagoonGuardV0Flow, { guard, state });

		expect(screen.getByText('Processed in 24h window so far')).toBeInTheDocument();
		expect(screen.getByText('$1,500')).toBeInTheDocument();
		expect(screen.getByText('Window resets')).toBeInTheDocument();
		expect(screen.getByText('15/11/2023, 22:13:20 UTC')).toBeInTheDocument();
	});

	it('reports an expired settlement window as available', () => {
		vi.useFakeTimers();
		vi.setSystemTime(new Date('2023-11-20T00:00:00Z'));

		render(LagoonGuardV0Flow, {
			guard,
			state: {
				portfolio: {
					reserves: {
						usdc: {
							balance_updates: {
								'1': {
									cause: 'deposit_and_redemption',
									block_mined_at: 1_700_000_000,
									other_data: { settlement_origin: 'executor_broadcast' }
								}
							}
						}
					}
				}
			} as State
		});

		const processedMetric = screen.getByText('Processed in 24h window so far').parentElement;
		expect(processedMetric).toHaveTextContent('$0');
		expect(screen.getByText('Available now')).toBeInTheDocument();
	});

	it.each([
		{ ...guard, daily_automatic_settlement_limit_enabled: false },
		{ ...guard, daily_automatic_settlement_limit: '0' },
		{ ...guard, settlement_cooldown_seconds: 3_600 },
		null,
		undefined
	])('hides an unavailable or unsupported policy', (policy) => {
		render(LagoonGuardV0Flow, { guard: policy });
		expect(screen.queryByRole('heading', { name: 'Deposit and redemption flow' })).not.toBeInTheDocument();
	});
});

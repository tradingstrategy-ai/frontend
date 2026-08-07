import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';
import LagoonGuardV0Flow from './LagoonGuardV0Flow.svelte';

const guard = {
	daily_automatic_settlement_limit_enabled: true,
	daily_automatic_settlement_limit: '5000',
	settlement_cooldown_seconds: 86_400
};

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

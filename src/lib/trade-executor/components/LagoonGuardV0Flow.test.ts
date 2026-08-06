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
		render(LagoonGuardV0Flow, { guard });

		expect(screen.getByRole('heading', { name: 'Deposit and redemption flow' })).toBeInTheDocument();
		expect(screen.getByText('$5,000')).toBeInTheDocument();
		expect(screen.getByText('/24h')).toBeInTheDocument();
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

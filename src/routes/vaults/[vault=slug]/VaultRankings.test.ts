import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, expect, test } from 'vitest';
import { createPeriodMetrics, createTestVault } from '$lib/top-vaults/test-utils';
import type { PeriodMetrics } from '$lib/top-vaults/schemas';
import VaultRankings from './VaultRankings.svelte';

const zeroReturnMessage = 'Unranked (0% annualised return over one month)';

afterEach(cleanup);

function renderRankings(...periodResults: PeriodMetrics[]) {
	const vault = createTestVault('Test vault', { period_results: periodResults });
	render(VaultRankings, { props: { vault, chain: undefined, protocolMetadata: undefined } });
}

test.each([createPeriodMetrics('1M', 0.01, 0.12, 0), createPeriodMetrics('1M', 0, 0, null)])(
	'explains an unranked month with exactly zero annualised return',
	(month) => {
		const lifetime = { ...createPeriodMetrics('lifetime', 0.1, 0.1, null), ranking_overall: 30 };
		renderRankings(month, lifetime);

		expect(screen.getByText(zeroReturnMessage)).toBeInTheDocument();
		expect(screen.queryByText('#30')).not.toBeInTheDocument();
	}
);

test('shows the one-month rank for a small non-zero return', () => {
	const month = { ...createPeriodMetrics('1M', 0, 0, 0.000001), ranking_overall: 30 };
	renderRankings(month);

	expect(screen.getByText('#30')).toBeInTheDocument();
	expect(screen.queryByText(zeroReturnMessage)).not.toBeInTheDocument();
});

test.each([
	{ ...createPeriodMetrics('1M', 0, 0, null), error_reason: 'Insufficient data' },
	createPeriodMetrics('1M', 0, 0, 0.000001),
	createPeriodMetrics('1W', 0, 0, null)
])('keeps the rank group hidden when zero return cannot explain a missing monthly rank', (period) => {
	renderRankings(period);

	expect(screen.queryByText('Rank')).not.toBeInTheDocument();
});

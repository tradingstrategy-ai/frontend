import { describe, expect, it } from 'vitest';
import { toVaultListingRow } from './helpers';
import { vaultListingPeriodMetricKeys, vaultListingRowKeys } from './schemas';
import { createPeriodMetrics, createTestVault } from './test-utils';

describe('toVaultListingRow', () => {
	const lifetime = { ...createPeriodMetrics('lifetime', 0.2, 0.2, 0.18), max_drawdown: -0.03, daily_samples: 365 };
	const vault = createTestVault('Projection vault', {
		description: 'A long marketing description that the listing table never renders',
		period_results: [lifetime]
	});

	const row = toVaultListingRow(vault);

	it('keeps exactly the listing row keys plus period results', () => {
		expect(Object.keys(row).sort()).toEqual([...vaultListingRowKeys, 'period_results'].sort());
	});

	it('drops detail-only fields', () => {
		expect(row).not.toHaveProperty('description');
		expect(row).not.toHaveProperty('share_token_address');
		expect(row).not.toHaveProperty('first_updated_at');
	});

	it('keeps the fields the table and return columns read', () => {
		expect(row.name).toBe('Projection vault');
		expect(row.one_month_cagr).toBe(vault.one_month_cagr);
		expect(row.lifetime_return).toBe(vault.lifetime_return);
		expect(row.denomination_token_rate).toEqual(vault.denomination_token_rate);
	});

	it('drops the periods no listing column reads', () => {
		const projected = toVaultListingRow({
			...vault,
			period_results: [
				createPeriodMetrics('1W', 0, 0, 0),
				createPeriodMetrics('1M', 0, 0, 0),
				createPeriodMetrics('3M', 0, 0, 0),
				lifetime
			]
		});
		expect(projected.period_results.map((p) => p.period)).toEqual(['3M', 'lifetime']);
	});

	it('slims each period result to the listing metrics', () => {
		expect(row.period_results).toHaveLength(1);
		expect(Object.keys(row.period_results[0]).sort()).toEqual([...vaultListingPeriodMetricKeys].sort());
		expect(row.period_results[0]).toMatchObject({
			period: 'lifetime',
			returns_net: 0.18,
			cagr_gross: 0.2,
			max_drawdown: -0.03,
			daily_samples: 365
		});
		expect(row.period_results[0]).not.toHaveProperty('share_price_start');
		expect(row.period_results[0]).not.toHaveProperty('ranking_overall');
	});
});

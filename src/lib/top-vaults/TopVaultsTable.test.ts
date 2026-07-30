import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import TopVaultsTable from './TopVaultsTable.svelte';
import { createTestVault } from './test-utils';

afterEach(cleanup);

vi.stubGlobal(
	'ResizeObserver',
	class {
		observe() {}
		unobserve() {}
		disconnect() {}
	}
);

function getRenderedVaultNames() {
	return Array.from(document.querySelectorAll('tbody tr td.vault strong')).map((element) => element.textContent);
}

describe('TopVaultsTable risk rating column', () => {
	it('shows and sorts CORE3 ratings from lowest Probability of Loss first', () => {
		const saferVault = createTestVault('Safer CORE3 vault', { protocol: 'Safer CORE3' });
		const riskierVault = createTestVault('Riskier CORE3 vault', { protocol: 'Riskier CORE3' });

		render(TopVaultsTable, {
			props: {
				topVaults: {
					generated_at: '2026-07-30T11:30:40Z',
					vaults: [riskierVault, saferVault],
					core3_protocols: {
						'safer-core3': {
							slug: 'safer-core3',
							name: 'Safer CORE3',
							pol: { score: 12, rating: 'AA', confidence: 'High' }
						},
						'riskier-core3': {
							slug: 'riskier-core3',
							name: 'Riskier CORE3',
							pol: { score: 76, rating: 'D', confidence: 'High' }
						}
					},
					curators: {}
				},
				ratingProvider: 'core3',
				defaultSort: 'provider_risk_rating',
				defaultDirection: 'asc'
			}
		});

		expect(screen.getByRole('columnheader', { name: 'Risk rating' })).toBeInTheDocument();
		expect(getRenderedVaultNames()).toEqual(['Safer CORE3 vault', 'Riskier CORE3 vault']);
		expect(screen.getByText('AA')).toHaveAttribute('data-tone', 'excellent');
		expect(screen.getByText('D')).toHaveAttribute('data-tone', 'poor');
		expect(screen.getAllByText(/graded from AA \(lowest risk\) down to D/)).toHaveLength(2);
	});

	it('shows and sorts Xerberus ratings from highest score first', () => {
		const saferVault = createTestVault('Safer Xerberus vault', {
			xerberus: {
				score: 91,
				score_scale: '0_100_higher_is_better',
				entity_type: 'pool',
				entity_id: 'safer-xerberus-vault',
				name: 'Safer Xerberus vault',
				protocol_slug: null,
				report_url: 'https://app.xerberus.io/pool/dendrogram/safer-xerberus-vault',
				fetched_at: '2026-07-30T11:30:40Z'
			}
		});
		const riskierVault = createTestVault('Riskier Xerberus vault', {
			xerberus: {
				score: 58,
				score_scale: '0_100_higher_is_better',
				entity_type: 'pool',
				entity_id: 'riskier-xerberus-vault',
				name: 'Riskier Xerberus vault',
				protocol_slug: null,
				report_url: 'https://app.xerberus.io/pool/dendrogram/riskier-xerberus-vault',
				fetched_at: '2026-07-30T11:30:40Z'
			}
		});

		render(TopVaultsTable, {
			props: {
				topVaults: {
					generated_at: '2026-07-30T11:30:40Z',
					vaults: [riskierVault, saferVault],
					core3_protocols: {},
					curators: {}
				},
				ratingProvider: 'xerberus',
				defaultSort: 'provider_risk_rating',
				defaultDirection: 'desc'
			}
		});

		expect(getRenderedVaultNames()).toEqual(['Safer Xerberus vault', 'Riskier Xerberus vault']);
		expect(screen.getByText('91')).toBeInTheDocument();
		expect(screen.getAllByText(/Xerberus scored this vault directly/)).toHaveLength(2);
	});
});

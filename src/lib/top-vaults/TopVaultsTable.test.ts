import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { getChain } from '$lib/helpers/chain';
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

vi.mock('$lib/vault-protocol/helpers', () => ({
	getVaultProtocolLogoUrl: (slug: string) => `https://example.com/protocol/${slug}.svg`
}));

function getRenderedVaultNames() {
	return Array.from(document.querySelectorAll('tbody tr td.vault strong')).map((element) => element.textContent);
}

describe('TopVaultsTable risk rating column', () => {
	it('shows the blacklisted-vault reveal control when the server summary reports hidden vaults', () => {
		const safeVault = createTestVault('Safe vault', { risk: 'Low' });
		const blacklistedVault = createTestVault('Blacklisted vault', { risk: 'Blacklisted' });

		render(TopVaultsTable, {
			props: {
				topVaults: {
					generated_at: '2026-07-30T11:30:40Z',
					vaults: [safeVault, blacklistedVault],
					core3_protocols: {},
					curators: {}
				},
				listingSummary: {
					matchingCount: 1,
					hiddenByTvl: 0,
					hiddenBlacklistedCount: 1,
					hiddenVaultNames: [],
					totalTvl: 100_000,
					avgTvlWeightedApy1M: 0.1
				}
			}
		});

		expect(screen.getByRole('button', { name: 'Show 1 blacklisted vault' })).toBeInTheDocument();
		expect(getRenderedVaultNames()).toEqual(['Safe vault']);
	});

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

		expect(screen.getByRole('columnheader', { name: 'Risk' })).toBeInTheDocument();
		expect(screen.queryByRole('columnheader', { name: 'Protocol Technical Risk' })).not.toBeInTheDocument();
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

		expect(screen.getByRole('columnheader', { name: 'Risk' })).toBeInTheDocument();
		expect(screen.queryByRole('columnheader', { name: 'Protocol Technical Risk' })).not.toBeInTheDocument();
		expect(getRenderedVaultNames()).toEqual(['Safer Xerberus vault', 'Riskier Xerberus vault']);
		expect(screen.getByText('91')).toBeInTheDocument();
		expect(screen.getAllByText(/Xerberus scored this vault directly/)).toHaveLength(2);
	});

	it('uses curator logos before protocol logos when a chain column is hidden', () => {
		const curatorVault = createTestVault('Curated vault', {
			chain: 'arbitrum',
			protocol: 'Aave',
			curator_slug: 'curator'
		});
		const protocolVault = createTestVault('Protocol vault', { chain: 'arbitrum', protocol: 'Aave' });

		render(TopVaultsTable, {
			props: {
				topVaults: {
					generated_at: '2026-07-30T11:30:40Z',
					vaults: [curatorVault, protocolVault],
					core3_protocols: {},
					curators: {
						curator: {
							slug: 'curator',
							name: 'Example curator',
							website: null,
							twitter: null,
							linkedin: null,
							rss: null,
							protocol_curator: false,
							canonical_feeder_id: null,
							logos: { generic: 'https://example.com/curator-logo.svg', light: null, dark: null },
							recent_posts: []
						}
					}
				},
				chain: getChain('arbitrum')!
			}
		});

		const curatorLogo = screen.getByText('Curated vault').closest('td')?.querySelector<HTMLImageElement>('.vault-logo');
		const protocolLogo = screen
			.getByText('Protocol vault')
			.closest('td')
			?.querySelector<HTMLImageElement>('.vault-logo');

		expect(curatorLogo?.src).toBe('https://example.com/curator-logo.svg');
		expect(protocolLogo?.src).toBe('https://example.com/protocol/aave.svg');
	});
});

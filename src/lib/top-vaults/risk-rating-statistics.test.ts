import { describe, expect, it } from 'vitest';
import { getRiskRatingTvlBands } from './risk-rating-statistics';
import { createTestVault } from './test-utils';

describe('getRiskRatingTvlBands', () => {
	it('groups Xerberus-rated TVL into six score bands with the highest scores safest', () => {
		const lowerScoreVault = createTestVault('Lower score vault', {
			current_nav: 10,
			xerberus: {
				score: 0,
				score_scale: '0_100_higher_is_better',
				entity_type: 'pool',
				entity_id: 'lower-score-vault',
				name: 'Lower score vault',
				protocol_slug: null,
				report_url: 'https://app.xerberus.io/pool/dendrogram/lower-score-vault',
				fetched_at: '2026-07-30T11:30:40Z'
			}
		});
		const higherScoreVault = createTestVault('Higher score vault', {
			current_nav: 90,
			xerberus: {
				score: 100,
				score_scale: '0_100_higher_is_better',
				entity_type: 'pool',
				entity_id: 'higher-score-vault',
				name: 'Higher score vault',
				protocol_slug: null,
				report_url: 'https://app.xerberus.io/pool/dendrogram/higher-score-vault',
				fetched_at: '2026-07-30T11:30:40Z'
			}
		});

		const bands = getRiskRatingTvlBands(
			{
				generated_at: '2026-07-30T11:30:40Z',
				vaults: [lowerScoreVault, higherScoreVault],
				core3_protocols: {},
				curators: {}
			},
			'xerberus'
		);

		expect(bands.map(({ label }) => label)).toEqual(['0–16', '17–33', '34–49', '50–66', '67–83', '84–100']);
		expect(bands[0]).toMatchObject({ tvl: 10, name: '0–16 · highest risk scores' });
		expect(bands[5]).toMatchObject({ tvl: 90, name: '84–100 · safest scores' });
	});

	it('uses compact CORE3 letter ratings and their existing risk tones', () => {
		const saferVault = createTestVault('Safer CORE3 vault', {
			current_nav: 75,
			core3: {
				risk_score: 10,
				risk_rating_label: 'AA',
				market_cap: null,
				core3_ranking: null,
				data_coverage: null,
				confidence: null
			}
		});
		const riskierVault = createTestVault('Riskier CORE3 vault', {
			current_nav: 25,
			core3: {
				risk_score: 90,
				risk_rating_label: 'D',
				market_cap: null,
				core3_ranking: null,
				data_coverage: null,
				confidence: null
			}
		});

		const bands = getRiskRatingTvlBands(
			{ generated_at: '2026-07-30T11:30:40Z', vaults: [saferVault, riskierVault], core3_protocols: {}, curators: {} },
			'core3'
		);

		expect(bands).toMatchObject([
			{ label: 'AA', name: 'AA · lowest risk', tvl: 75, tone: 'excellent' },
			{ label: 'D', name: 'D · highest risk', tvl: 25, tone: 'poor' }
		]);
	});
});

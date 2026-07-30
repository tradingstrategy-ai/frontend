import { describe, expect, it } from 'vitest';
import { curatorInfoSchema, topVaultsSchema } from './schemas';
import { createTestVault } from './test-utils';

const validCurator = {
	slug: 'steakhouse-financial',
	name: 'Steakhouse Financial',
	website: 'https://example.com/steakhouse',
	twitter: null,
	linkedin: null,
	rss: null,
	protocol_curator: false,
	canonical_feeder_id: null,
	logos: { generic: null, dark: null, light: null },
	recent_posts: [
		{
			title: 'Latest market update',
			snippet: 'A summary of recent curation activity.',
			link: 'https://example.com/steakhouse/post-1',
			source_type: 'rss',
			published_at: '2026-01-05T00:00:00'
		}
	]
};

const basePayload = {
	generated_at: '2026-06-10T00:00:00Z',
	vaults: []
};

describe('topVaultsSchema resilience', () => {
	it('parses curator metadata', () => {
		const result = topVaultsSchema.parse({ ...basePayload, curators: { [validCurator.slug]: validCurator } });
		expect(result.curators['steakhouse-financial'].name).toBe('Steakhouse Financial');
		expect(result.curators['steakhouse-financial'].recent_posts).toHaveLength(1);
	});

	it('defaults curators to an empty record when absent', () => {
		expect(topVaultsSchema.parse(basePayload).curators).toEqual({});
	});

	it('falls back to an empty curators record on a malformed payload instead of failing the parse', () => {
		const malformed = { ...basePayload, curators: { broken: { slug: 'broken' } } };
		const result = topVaultsSchema.parse(malformed);
		expect(result.curators).toEqual({});
		expect(result.vaults).toEqual([]);
	});

	it('drops malformed recent posts without failing the curator', () => {
		const curator = {
			...validCurator,
			recent_posts: [{ link: 42 }]
		};
		const result = curatorInfoSchema.parse(curator);
		expect(result.recent_posts).toEqual([]);
		expect(result.name).toBe('Steakhouse Financial');
	});

	it('preserves valid Xerberus per-vault assessments and drops malformed ones', () => {
		const xerberus = {
			score: 78,
			score_scale: '0_100_higher_is_better',
			entity_type: 'pool',
			entity_id: 'lagoon-example-vault',
			name: 'Example vault',
			protocol_slug: null,
			report_url: 'https://app.xerberus.io/pool/dendrogram/lagoon-example-vault',
			fetched_at: '2026-07-27T16:01:01.992171'
		};
		const result = topVaultsSchema.parse({
			...basePayload,
			vaults: [
				createTestVault('Example vault', { xerberus }),
				createTestVault('Malformed Xerberus vault', {
					xerberus: { ...xerberus, report_url: 'not a URL' }
				})
			]
		});

		expect(result.vaults[0].xerberus).toEqual(xerberus);
		expect(result.vaults[1].xerberus).toBeNull();
	});
});

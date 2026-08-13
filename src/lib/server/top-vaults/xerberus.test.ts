import { describe, expect, it } from 'vitest';
import { createTestVault } from '$lib/top-vaults/test-utils';
import { getXerberusProtocolAssessment } from './xerberus';

const protocolAssessment = {
	score: 78,
	score_scale: '0_100_higher_is_better',
	entity_type: 'protocol',
	entity_id: 'example-protocol',
	name: 'Example protocol',
	protocol_slug: 'example',
	report_url: 'https://app.xerberus.io/protocol/dendrogram/example-protocol',
	fetched_at: '2026-08-12T12:00:00Z'
} as const;

describe('getXerberusProtocolAssessment', () => {
	it('gets a protocol assessment from the vault JSON', () => {
		const assessment = getXerberusProtocolAssessment(
			[
				createTestVault('Example vault', { protocol: 'Example', xerberus: protocolAssessment }),
				createTestVault('Directly rated vault', {
					xerberus: {
						...protocolAssessment,
						entity_type: 'pool',
						entity_id: 'direct-vault',
						protocol_slug: null
					}
				})
			],
			'example'
		);

		expect(assessment).toEqual(protocolAssessment);
	});

	it('does not use pool assessments or a different protocol assessment', () => {
		const vaults = [
			createTestVault('Directly rated vault', {
				xerberus: {
					...protocolAssessment,
					entity_type: 'pool',
					protocol_slug: null
				}
			}),
			createTestVault('Other protocol vault', {
				xerberus: { ...protocolAssessment, protocol_slug: 'other-protocol' }
			})
		];

		expect(getXerberusProtocolAssessment(vaults, 'example')).toBeNull();
	});
});

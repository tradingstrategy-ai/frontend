import { cleanup, render, screen } from '@testing-library/svelte';
import { afterEach, describe, expect, it } from 'vitest';
import XerberusRisk from './XerberusRisk.svelte';

afterEach(cleanup);

const baseAssessment = {
	score: 78,
	score_scale: '0_100_higher_is_better',
	entity_id: 'example-vault',
	name: 'Example vault',
	protocol_slug: null,
	fetched_at: '2026-07-27T16:01:01.992171'
};

describe('XerberusRisk', () => {
	it('renders direct pool assessments with their Xerberus report link', () => {
		render(XerberusRisk, {
			props: {
				xerberus: {
					...baseAssessment,
					entity_type: 'pool',
					report_url: 'https://app.xerberus.io/pool/dendrogram/example-vault'
				}
			}
		});

		expect(screen.getByRole('heading', { name: 'Xerberus risk rating' })).toBeInTheDocument();
		expect(screen.getByAltText('Xerberus')).toHaveAttribute('src', 'https://app.xerberus.io/favicon.ico');
		expect(screen.getByText('78 / 100')).toBeInTheDocument();
		expect(screen.getByText('Pool-level')).toBeInTheDocument();
		expect(screen.getByText('This is a Xerberus risk rating for this vault. Higher is better.')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'View this vault rating on Xerberus' })).toHaveAttribute(
			'href',
			'https://app.xerberus.io/pool/dendrogram/example-vault'
		);
	});

	it('explains when the assessment falls back to the underlying protocol', () => {
		render(XerberusRisk, {
			props: {
				xerberus: {
					...baseAssessment,
					entity_type: 'protocol',
					name: 'Example protocol',
					protocol_slug: 'example',
					report_url: 'https://app.xerberus.io/protocol/dendrogram/example-protocol'
				}
			}
		});

		expect(screen.getByText('Protocol-level')).toBeInTheDocument();
		expect(
			screen.getByText('This is a Xerberus risk rating for this vault’s underlying protocol. Higher is better.')
		).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'View this protocol rating on Xerberus' })).toHaveAttribute(
			'href',
			'https://app.xerberus.io/protocol/dendrogram/example-protocol'
		);
	});

	it('does not fall back to the Xerberus landing page when a report URL is absent', () => {
		render(XerberusRisk, {
			props: {
				xerberus: {
					...baseAssessment,
					entity_type: 'pool',
					report_url: null
				}
			}
		});

		expect(screen.queryByRole('link', { name: /Xerberus/ })).not.toBeInTheDocument();
	});
});

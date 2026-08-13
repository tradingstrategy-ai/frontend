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
	it('uses the shared compact rating header and links to the full Xerberus rating', () => {
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
		expect(screen.getByAltText('Xerberus logo')).toHaveAttribute('src', 'https://app.xerberus.io/favicon.ico');
		expect(screen.getByText('78', { exact: true })).toBeInTheDocument();
		expect(screen.getByText('View more')).toBeInTheDocument();
		expect(screen.getByRole('link', { name: 'Visit Xerberus to view the full vault risk rating.' })).toHaveAttribute(
			'href',
			'https://app.xerberus.io/pool/dendrogram/example-vault'
		);
		expect(screen.queryByText('Assessment level')).not.toBeInTheDocument();
		expect(screen.queryByText('Rated entity')).not.toBeInTheDocument();
		expect(screen.queryByText('Xerberus score')).not.toBeInTheDocument();
	});

	it('uses the same link-out message for protocol assessments', () => {
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

		expect(screen.getByRole('link', { name: 'Visit Xerberus to view the full protocol risk rating.' })).toHaveAttribute(
			'href',
			'https://app.xerberus.io/protocol/dendrogram/example-protocol'
		);
	});

	it('links to the Xerberus website when an individual report URL is absent', () => {
		render(XerberusRisk, {
			props: {
				xerberus: {
					...baseAssessment,
					entity_type: 'pool',
					report_url: null
				}
			}
		});

		expect(screen.getByRole('link', { name: 'Visit Xerberus to view the full vault risk rating.' })).toHaveAttribute(
			'href',
			'https://xerberus.io/'
		);
	});

	it('formats protocol scores on the shared 0–100 score badge', () => {
		render(XerberusRisk, {
			props: {
				xerberus: {
					id: 'example-protocol',
					name: 'Example protocol',
					score: 0.78,
					url: 'https://app.xerberus.io/protocol/dendrogram/example-protocol'
				}
			}
		});

		expect(screen.getByText('78', { exact: true })).toBeInTheDocument();
		expect(screen.getByLabelText('Xerberus score 78 out of 100')).toHaveTextContent('78');
		expect(screen.getByRole('link', { name: 'Visit Xerberus to view the full protocol risk rating.' })).toHaveAttribute(
			'href',
			'https://app.xerberus.io/protocol/dendrogram/example-protocol'
		);
	});
});

<!-- Render one glossary term

- Uses Google FAQ page JSON-LD https://developers.google.com/search/docs/appearance/structured-data/faqpage

- How to generate application/ld+json in Svelte https://stackoverflow.com/a/59809388/315168

-->
<script lang="ts">
	import type { GlossaryEntry } from '../glossary';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { ContentCardsSection, ContentCard } from '$lib/components';
	import { serializeSchema } from '$lib/helpers/google-meta';
	import { Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';

	export let data;
	$: ({ entry } = data);

	/**
	 * Generate LD JSON markup
	 *
	 * https://developers.google.com/search/docs/appearance/structured-data/faqpage
	 */
	function getGoogleFAQPageSchema({ name, html }: GlossaryEntry): object {
		const jsonData = {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: [
				{
					'@type': 'Question',
					name: `What is ${name}?`,
					acceptedAnswer: {
						'@type': 'Answer',
						text: html
					}
				}
			]
		};
		return jsonData;
	}
</script>

<svelte:head>
	<title>What is {entry.name}?</title>
	<meta name="description" content={entry.description} />
	{@html serializeSchema(getGoogleFAQPageSchema(entry))}
</svelte:head>

<main>
	<Breadcrumbs labels={{ [entry.slug]: entry.name }} />

	<Section tag="article" padding="sm" gap="sm">
		<h1 data-testid="glossary-heading">What Is {entry.name}?</h1>
		<div class="answer">
			{@html entry.html}
		</div>
	</Section>

	<ContentCardsSection>
		<ContentCard icon="dictionary" title="DeFi and trading Dictionary" ctaLabel="View dictionary" href="/glossary">
			<p>
				You are currently browing Trading Strategy's DeFi, Web3 and trading terminology database. See the full
				dictionary for more terms.
			</p>
		</ContentCard>

		<ContentCard
			icon="book"
			title="Learn algorithmic trading"
			ctaLabel="Show tutorials and videos"
			href="https://tradingstrategy.ai/docs/learn/index.html"
			rel="external"
			description="Start learning algorithmic trading and quantitative finance from Trading Strategy's learning resources collection."
		/>
	</ContentCardsSection>

	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style lang="postcss">
	h1 {
		font: var(--f-h1-medium);
		text-transform: capitalize;
	}

	.answer :global {
		display: grid;
		gap: var(--space-lg);
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		/* Format tags in HTML output */
		a,
		a:hover {
			color: inherit;
			font-weight: 700;
			text-decoration: underline;
		}

		p {
			margin-bottom: 0.5rem;
		}
	}
</style>

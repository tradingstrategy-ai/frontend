<!-- Render one glossary term

- Uses Google FAQ page JSON-LD https://developers.google.com/search/docs/appearance/structured-data/faqpage

- How to generate application/ld+json in Svelte https://stackoverflow.com/a/59809388/315168

-->
<script lang="ts">
	import type { PageData } from './$types';
	import type { GlossaryEntry } from '../api/types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { ContentCardsSection, ContentCard } from '$lib/components';
	import { serializeSchema } from '$lib/helpers/googleMeta';
	import { Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';

	export let data: PageData;
	$: term = data.term;

	/**
	 * Generate LD JSON markup
	 *
	 * https://developers.google.com/search/docs/appearance/structured-data/faqpage
	 */
	function getGoogleFAQPageSchema(term: GlossaryEntry): object {
		const jsonData = {
			'@context': 'https://schema.org',
			'@type': 'FAQPage',
			mainEntity: [
				{
					'@type': 'Question',
					name: `What is ${term.name}?`,
					acceptedAnswer: {
						'@type': 'Answer',
						text: term.html
					}
				}
			]
		};
		return jsonData;
	}
</script>

<svelte:head>
	<title>What is {term.name}?</title>
	<meta name="description" content={term.shortDescription} />
	{@html serializeSchema(getGoogleFAQPageSchema(term))}
</svelte:head>

<main>
	<Breadcrumbs labels={{ [$page.params.slug]: term.name }} />

	<Section layout="boxed">
		<article>
			<h1 data-testid="glossary-heading">What Is {term.name}?</h1>
			<div class="answer">
				{@html term.html}
			</div>
		</article>
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
			description="Start learning algorithmic trading and quantitative finance from Trading Strategy's learning resources collection."
		/>
	</ContentCardsSection>

	<Section class="newsletter" id="glossary-newsletter" layout="boxed" padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-lg);

		@media (--viewport-sm-down) {
			gap: var(--space-ms);
		}
	}

	article {
		gap: var(--space-2xl);
	}

	h1 {
		font: var(--f-h1-medium);
		margin-bottom: var(--space-xl);
		text-transform: capitalize;
	}

	.answer :global {
		display: grid;
		gap: var(--space-lg);
		font: var(--f-ui-lg-roman);
		letter-spacing: var(--f-ui-lg-spacing, normal);

		/* Format tags in HTML output */
		& a,
		& a:hover {
			color: inherit;
			font-weight: 700;
			text-decoration: underline;
		}

		& p {
			margin-bottom: 0.5rem;
		}
	}
</style>

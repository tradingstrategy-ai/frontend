<!-- Render one glossary term

- Uses Google FAQ page JSON-LD https://developers.google.com/search/docs/appearance/structured-data/faqpage

- How to generate application/ld+json in Svelte https://stackoverflow.com/a/59809388/315168

-->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { serializeSchema } from '$lib/helpers/googleMeta';
	import { Section } from '$lib/components';
	import type { GlossaryEntry } from '../api/types';

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

<Breadcrumbs labels={{ [$page.params.slug]: term.name }} />

<Section layout="boxed">
	<article>
		<h1 data-testid="glossary-heading">What Is {term.name}?</h1>
		<div class="answer">
			{@html term.html}
		</div>
	</article>
</Section>

<style lang="postcss">
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
	}
</style>

<!-- Render one glossary term

- Uses Google FAQ page JSON-LD https://developers.google.com/search/docs/appearance/structured-data/faqpage

- How to generate application/ld+json in Svelte https://stackoverflow.com/a/59809388/315168

-->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import {serializeSchema} from "./jsonld";
	import type { GlossaryEntry } from '../api/types';

	export let data: PageData;
	let term: GlossaryEntry = data.term;

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

<article>
	<h1 data-testid="glossary-heading">What Is {term.name}?</h1>
	<div class="answer">
		{@html term.html}
	</div>
</article>

<style lang="postcss">
	article {
		max-width: var(--container-max-width);
		margin: auto;
	}

	h1 {
		font: var(--f-h1-medium);
		margin-bottom: var(--space-2xl);
		text-transform: capitalize;
	}

	.answer :global {
		/* Format tags in HTML output */
		& p:not(:first-of-type) {
			margin-top: var(--space-lg);
		}

		& a,
		& a:hover {
			text-decoration: underline;
			color: inherit;
		}
	}
</style>

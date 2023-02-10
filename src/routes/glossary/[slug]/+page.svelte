<!-- Render one glossary term

- Uses Google Q&A markup https://developers.google.com/search/docs/appearance/structured-data/qapage

- How to generate application/ld+json in Svelte https://stackoverflow.com/a/59809388/315168

-->
<script lang="ts">
	import type { PageData } from './$types';
	import { page } from '$app/stores';
	import Breadcrumbs from '$lib/breadcrumb/Breadcrumbs.svelte';
	import { Timestamp } from '$lib/components';
	import type {GlossaryEntry} from "../api/types";

	export let data: PageData;
	let term: GlossaryEntry = data.term;
</script>

<!--
    {
      "@context": "https://schema.org",
      "@type": "QAPage",
      "mainEntity": {
        "@type": "Question",
        "name": "How many ounces are there in a pound?",
        "text": "I have taken up a new interest in baking and keep running across directions in ounces and pounds. I have to translate between them and was wondering how many ounces are in a pound?",
        "answerCount": 3,
        "upvoteCount": 26,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "1 pound (lb) is equal to 16 ounces (oz).",
          "upvoteCount": 1337,
          "url": "https://example.com/question1#acceptedAnswer"
          },
        "suggestedAnswer": [
          {
            "@type": "Answer",
            "text": "Are you looking for ounces or fluid ounces? If you are looking for fluid ounces there are 15.34 fluid ounces in a pound of water.",
            "upvoteCount": 42,
            "url": "https://example.com/question1#suggestedAnswer1"
          }, {
            "@type": "Answer",
            "text": " I can't remember exactly, but I think 18 ounces in a lb. You might want to double check that.",
            "upvoteCount": 0,
            "url": "https://example.com/question1#suggestedAnswer2"
          }
        ]
      }
    }
-->


<svelte:head>
	<title>What is {term.name}?</title>
	<meta name="description" content={term.shortDescription} />
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

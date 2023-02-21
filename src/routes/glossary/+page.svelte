<!-- Render the glossary index page with a link to the each term -->
<script lang="ts">
	import type { PageData } from './$types';
	import { HeroBanner, Section } from '$lib/components';
	import type { GlossaryEntry, GlossaryMap } from './api/types';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';

	export let data: PageData;

	const { glossary } = data;

	function buildIndex(glossary: GlossaryMap) {
		let index: Record<string, GlossaryEntry[]> = {};
		for (const [key, value] of Object.entries(glossary)) {
			const firstLetter = key[0];
			index[firstLetter] ||= [];
			index[firstLetter].push(value);
		}
		return index;
	}

	const index = buildIndex(glossary);
</script>

<svelte:head>
	<title>DeFi and trading dictionary</title>
	<meta name="description" content="What do different technical trading terms mean?" />
</svelte:head>

<main class="glossary-main">
	<Section header layout="boxed" padding="md">
		<HeroBanner contentFullWidth title="DeFi and trading dictionary">
			<div slot="subtitle">
				<p>Browser explanations for different decentralised finance (DeFi) and technical trading terms.</p>

				<p class="glossary-introduction">
					This dictionary has been compiled to help newcomers to get quickly familiar with
					<a class="body-link" href="/glossary/decentralised-finance">decentralised finance</a>,
					<a class="body-link" href="/glossary/decentralised-exchange">decentralised exchanges</a>,
					<a class="body-link" href="/glossary/trading-strategy">trading strategies</a> and
					<a class="body-link" href="/glossary/algorithmic-trading">algorithmic trading</a>.
				</p>
			</div>
		</HeroBanner>
	</Section>

	<Section class="content" layout="boxed" padding="sm">
		{#each Object.entries(index) as [letter, terms]}
			<div class="index-letter">
				<h2>{letter.toUpperCase()}</h2>
				<hr />
				<div class="terms">
					{#each terms as term}
						<a class="term" data-testid="index-term" href={`/glossary/${term.slug}`}>
							{term.name}
						</a>
					{/each}
				</div>
			</div>
		{/each}
	</Section>

	<Section class="newsletter" id="glossary-newsletter" layout="boxed" padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
	}

	h2 {
		font: var(--f-h2-medium);
		@media (--viewport-md-up) {
			font: var(--f-heading-xl-medium);
		}
	}

	main :global .content {
		overflow: auto;

		& .grid {
			grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
			gap: var(--space-3xl) var(--space-2xl);
		}
	}

	.terms {
		display: grid;
		gap: var(--space-xxxs);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
	}

	.term:hover {
		text-decoration: underline;
	}

	hr {
		margin: var(--space-lg) 0;
		border: 0.125rem solid hsla(var(--hsl-text));

		@media (--viewport-lg-down) {
			margin: var(--space-md) 0;
		}
	}
</style>

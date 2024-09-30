<!-- Render the glossary index page with a link to the each term -->
<script lang="ts">
	import type { GlossaryEntry } from './glossary';
	import { HeroBanner, Section } from '$lib/components';
	import NewsletterOptInBanner from '$lib/newsletter/OptInBanner.svelte';

	export let data;

	const { glossary } = data;

	const index = Object.values(glossary).reduce(
		(acc, entry) => {
			const firstChar = entry.slug[0];
			acc[firstChar] ??= [];
			acc[firstChar].push(entry);
			return acc;
		},
		{} as Record<string, GlossaryEntry[]>
	);
</script>

<svelte:head>
	<title>DeFi and trading dictionary</title>
	<meta name="description" content="What do different technical trading terms mean?" />
</svelte:head>

<main class="glossary-main">
	<Section tag="header" padding="md">
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

	<Section padding="sm">
		<div class="content">
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
		</div>
	</Section>

	<Section padding="md">
		<NewsletterOptInBanner />
	</Section>
</main>

<style>
	main {
		display: grid;
		gap: var(--space-md);
	}

	.content {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--space-3xl) var(--space-2xl);
		overflow: auto;

		h2 {
			font: var(--f-heading-lg-medium);
			letter-spacing: var(--f-heading-lg-spacing, normal);

			@media (--viewport-md-up) {
				font: var(--f-heading-xl-medium);
				letter-spacing: var(--f-heading-xl-spacing, normal);
			}
		}
	}

	.terms {
		display: grid;
		gap: var(--space-xs);
		font: var(--f-ui-md-roman);
		letter-spacing: var(--f-ui-md-spacing, normal);
		@media (--viewport-sm-down) {
			gap: var(--space-md);
		}
	}

	.term:hover {
		text-decoration: underline;
	}

	hr {
		margin: var(--space-lg) 0;
		border: 1px solid var(--c-text);

		@media (--viewport-lg-down) {
			margin: var(--space-lg) 0 var(--space-xl);
		}
	}
</style>

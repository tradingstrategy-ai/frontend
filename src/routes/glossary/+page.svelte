<!-- Render the glossary index page with a link to the each term -->
<script lang="ts">
	import type { PageData } from './$types';
	import type { GlossaryEntry, GlossaryMap } from './api/types';

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
	<title>Trading and DeFi terminology</title>
	<meta name="description" content="What do different technical trading terms mean?" />
</svelte:head>

<main>
	<header class="ds-container">
		<h1>Technical trading and decentralised finance glossary</h1>
		<p class="description">Explanations for technical trading and decentralised finance terms.</p>
	</header>

	<section class="ds-container">
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
	</section>
</main>

<style lang="postcss">
	main {
		display: grid;
		gap: var(--space-md);
	}

	h1 {
		font: var(--f-h1-medium);
		padding-block: var(--space-2xl);
		text-transform: capitalize;
	}

	h2 {
		font: var(--f-h2-medium);
		@media (--viewport-md-up) {
			font: var(--f-heading-xl-medium);
		}
	}

	p {
		font: var(--f-ui-xl-roman);
	}

	section {
		grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
		gap: var(--space-lg);
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
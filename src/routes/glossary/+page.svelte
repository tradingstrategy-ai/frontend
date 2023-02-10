<!-- Render the glossary index page with a link to the each term -->
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;

	let { glossary } = data;

	function buildIndex(glossary) {
		let index: Record<string, string[]> = {};
		for (const [key, value] of Object.entries(glossary)) {
			const firstLetter = key[0];
			if (!index[firstLetter]) {
				index[firstLetter] = [];
			}
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
	<section>
		<h1>Technical trading and decentralised finance glossary</h1>

		<p class="description">Explanations for technical trading and decentralised finance terms.</p>

		{#each Object.entries(index) as [letter, terms]}
			<div class="index-letter">
				<h2>{letter.toUpperCase()}</h2>
				<hr />
				{#each terms as term}
					<a class="term" data-testid="index-term" href={`/glossary/${term.slug}`}>
						{term.name}
					</a>
				{/each}
			</div>
		{/each}
	</section>
</main>

<style lang="postcss">
	main {
		margin: var(--space-md);
	}

	h1 {
		font: var(--f-h1-medium);
		margin: var(--space-2xl) 0 !important;
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
		max-width: var(--container-max-width);
		margin: auto;
	}

	.index-letter {
		width: 300px;
		display: inline-block;
		padding: 0 var(--space-md) var(--space-md) 0;
		vertical-align: top;

		@media (--viewport-sm-down) {
			width: 100%;
		}
	}

	.term {
		display: block;
	}

	hr {
		width: 100%;
		margin: var(--space-lg) 0;
		border: 0.125rem solid hsla(var(--hsl-text));

		@media (--viewport-lg-down) {
			margin: var(--space-md) 0;
		}
	}
</style>
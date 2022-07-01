<script lang="ts">
	import IntroHero from './_IntroHero.svelte';
	import Audience from './_Audience.svelte';
</script>

<svelte:head>
	<title>About Us</title>
	<meta name="description" content="About Trading Strategy Protocol" />
</svelte:head>

<main>
	<IntroHero />
	<Audience />
</main>

<style>
	main :global(.btn-cta) {
		display: inline-block;
		padding: 0.75em 1.25em;
		background: var(--c-ink);
		color: var(--c-parchment);
		font-size: 0.8rem;
		font-weight: 500;
		text-align: center;
	}

	main :global(.btn-cta:hover) {
		opacity: 0.8;
	}
</style>

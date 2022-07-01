<script lang="ts">
	import IntroHero from './_IntroHero.svelte';
	import Audience from './_Audience.svelte';
	import Inquiry from './_Inquiry.svelte';
</script>

<svelte:head>
	<title>About Us</title>
	<meta name="description" content="About Trading Strategy Protocol" />
</svelte:head>

<main>
	<IntroHero />
	<Audience />

	<Inquiry
		title="Are you an institutional investor looking to create your own private strategies and deploy them on our protocol?"
	>
		<p>We offer private solutions for you to access new decentralised markets and DeFi protocols:</p>
		<ul>
			<li>Access or white-label our <strong>comprehensive market data sets</strong></li>
			<li>Gain <strong>access to new markets and investors</strong> directly on-chain, no counter-party risk</li>
			<li><strong>Create and deploy private strategies</strong> or invest in existing strategies</li>
			<li><strong>Host private strategies</strong> on your own private server(s)</li>
		</ul>
	</Inquiry>
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

	main :global(ul) {
		padding-left: 1.5rem;
	}

	main :global(li) {
		line-height: 1.2;
		margin-bottom: 1em;
	}
</style>

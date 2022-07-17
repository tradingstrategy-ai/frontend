<script lang="ts">
	import IntroHero from './_IntroHero.svelte';
	import Audience from './_Audience.svelte';
	import Inquiry from './_Inquiry.svelte';
	import Platform from './_Platform.svelte';
	import Summary from './_Summary.svelte';

	import DiscordIcon from './images/icon-discord.svg';
	import EmailIcon from './images/icon-email.svg';
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
		--max-width="680px"
	>
		<p>We offer private solutions for you to access new decentralised markets and DeFi protocols:</p>
		<ul>
			<li>Access or white-label our <strong>comprehensive market data sets</strong></li>
			<li>Gain <strong>access to new markets and investors</strong> directly on-chain, no counter-party risk</li>
			<li><strong>Create and deploy private strategies</strong> or invest in existing strategies</li>
			<li><strong>Host private strategies</strong> on your own private server(s)</li>
		</ul>
	</Inquiry>

	<Platform />

	<Inquiry title="Interested in our data for your service or platform?" --max-width="840px">
		<p>
			You can leverage our decentralised market data for your market analytics, technical analysis, service or platform.
		</p>
		<p>We offer bespoke services for market data where you will benefit from:</p>
		<ul>
			<li>On-chain market data <strong>directly from the integrated blockchains</strong></li>
			<li><strong>3 or more API keys</strong> included</li>
			<li>Customer support with <strong>24 hour response time</strong> (business days)</li>
			<li><strong>Flexible payment plans</strong> from upfront payment, 14-day net, quarterly invoice payment</li>
		</ul>
	</Inquiry>

	<Summary />

	<Inquiry title="Get in touch">
		<svelte:fragment slot="cta">
			<a class="btn-cta" href="mailto:info@tradingstrategy.ai">
				Send us an email
				<img src={EmailIcon} alt="email" />
			</a>
			<a class="btn-cta" href="https://discord.gg/en8tW6MDtw" target="_blank">
				Join our Discord server
				<img src={DiscordIcon} alt="discord" />
			</a>
		</svelte:fragment>
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
		text-transform: capitalize;
	}

	main :global(.btn-cta:hover) {
		opacity: 0.8;
	}

	main :global(.btn-cta img) {
		height: 16px;
		margin-left: 0.25rem;
		margin-bottom: 2px;
	}

	main :global(ul) {
		padding-left: 1.5rem;
	}

	main :global(li) {
		line-height: 1.2;
		margin-bottom: 1em;
	}

	.btn-cta {
		width: 13rem;
		margin-bottom: 0.5rem;
	}
</style>

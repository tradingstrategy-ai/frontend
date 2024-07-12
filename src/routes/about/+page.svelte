<script lang="ts">
	import { discordUrl } from '$lib/config';
	import { Banner, Button, HeroVideo, Section } from '$lib/components';
	import IntroHero from './IntroHero.svelte';
	import Audience from './Audience.svelte';
	import Partners from './Partners.svelte';
	import Platform from './Platform.svelte';
	import IconMail from '~icons/local/mail';
	import IconDiscord from '~icons/local/discord';
</script>

<svelte:head>
	<title>About Us</title>
	<meta name="description" content="About Trading Strategy Protocol" />
</svelte:head>

<main>
	<IntroHero />
	<HeroVideo youTubeId="KhOtk7xlLrw" title="Introducing TradingStrategy.ai" />
	<Audience />

	<Banner
		title="Are you an institutional investor looking to create your own private strategies and deploy them on our protocol?"
		padding="lg"
		gap="lg"
	>
		<p>We offer private solutions for you to access new decentralised markets and DeFi protocols:</p>
		<ul>
			<li>Access or white-label our <strong>comprehensive market data sets</strong></li>
			<li>Gain <strong>access to new markets and investors</strong> directly on-chain, no counter-party risk</li>
			<li><strong>Create and deploy private strategies</strong> or invest in existing strategies</li>
			<li><strong>Host private strategies</strong> on your own private server(s)</li>
		</ul>

		<Button slot="cta" label="Contact now" href="mailto:info@tradingstrategy.ai" />
	</Banner>

	<Partners />

	<Platform />

	<Banner title="Do you want to trade on decentralised markets?" padding="md" gap="md">
		<p>
			You can leverage our decentralised market data for your market analytics, technical analysis, service or platform.
		</p>
		<p>We offer customised services for market data where you will benefit from:</p>
		<ul>
			<li>On-chain market data <strong>directly from the integrated blockchains</strong></li>
			<li><strong>Many API keys</strong> included</li>
			<li>Customer support with <strong>24 hour response time</strong> (business days)</li>
			<li><strong>Flexible payment plans</strong> from upfront payment, 14-day net, quarterly invoice payment</li>
		</ul>

		<Button slot="cta" label="Contact now" href="mailto:info@tradingstrategy.ai" />
	</Banner>

	<Section gap="md" padding="md">
		<h2 style:text-align="center">Get in touch</h2>
		<div class="contact-cta">
			<Button secondary label="Send us an email" href="mailto:info@tradingstrategy.ai">
				<IconMail slot="icon" />
			</Button>
			<Button secondary label="Join our Discord server" href={discordUrl} target="_blank" rel="noreferrer">
				<IconDiscord slot="icon" />
			</Button>
		</div>
	</Section>
</main>

<style>
	.contact-cta {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(14rem, auto));
		gap: var(--space-ls);
		justify-self: center;
		justify-content: center;
		width: min(90vw, 40rem);
	}
</style>

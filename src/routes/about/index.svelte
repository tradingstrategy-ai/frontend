<script lang="ts">
	import IntroHero from './_IntroHero.svelte';
	import Audience from './_Audience.svelte';
	import Banner from '$lib/components/Banner.svelte';
	import Button from '$lib/components/Button.svelte';
	import Partners from './_Partners.svelte';
	import Platform from './_Platform.svelte';

	import DiscordIcon from './icons/discord.svg';
	import EmailIcon from './icons/email.svg';
</script>

<svelte:head>
	<title>About Us</title>
	<meta name="description" content="About Trading Strategy Protocol" />
</svelte:head>

<main>
	<IntroHero />
	<Audience />

	<Banner
		title="Are you an institutional investor looking to create your own private strategies and deploy them on our protocol?"
		maxWidth="850px"
	>
		<p>We offer private solutions for you to access new decentralised markets and DeFi protocols:</p>
		<ul>
			<li>Access or white-label our <strong>comprehensive market data sets</strong></li>
			<li>Gain <strong>access to new markets and investors</strong> directly on-chain, no counter-party risk</li>
			<li><strong>Create and deploy private strategies</strong> or invest in existing strategies</li>
			<li><strong>Host private strategies</strong> on your own private server(s)</li>
		</ul>

		<svelte:fragment slot="cta">
			<Button label="Contact now" href="mailto:info@tradingstrategy.ai" />
		</svelte:fragment>
	</Banner>

	<Partners />

	<Platform />

	<Banner title="Do you want to trade on decentralised markets?">
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

		<svelte:fragment slot="cta">
			<Button label="Contact now" href="mailto:info@tradingstrategy.ai" />
		</svelte:fragment>
	</Banner>

	<Banner secondary title="Get in touch">
		<svelte:fragment slot="cta">
			<Button label="Send us an email" icon="mail" href="mailto:info@tradingstrategy.ai" />
			<Button label="Join our Discord server" icon="discord" href="https://discord.gg/en8tW6MDtw" target="_blank" />
		</svelte:fragment>
	</Banner>
</main>

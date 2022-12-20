<!--

Where the user lands on his/her mobile after scanning the QR code
on the conference rolls.

-->
<script lang="ts">
	import { Hero, ContentTile } from '$lib/components';
	import BrandMark from '$lib/assets/brand-mark.svg?raw';
</script>

<svelte:head>
	<title>Follow Trading Strategy</title>
	<meta name="description" content="Follow us and discuss on social media" />
</svelte:head>

<main>
	<Hero title="Follow Trading Strategy" image={BrandMark}>Follow us on our socials and join the discussion.</Hero>

	<section class="ds-container">
		<ContentTile title="Discord chat" icon="discord" targetUrl="https://discord.gg/en8tW6MDtw">
			Join our expert community of traders, developers, and analysts and DeFi specialists.
		</ContentTile>

		<ContentTile title="Twitter" icon="twitter" targetUrl="https://twitter.com/TradingProtocol">
			Follow us on Twitter for trading alerts, DeFi insight and protocol news.
		</ContentTile>

		<ContentTile title="LinkedIn" icon="linkedin" targetUrl="https://www.linkedin.com/company/trading-strategy/">
			Follow us on LinkedIn and join our community of traders, developers and quant experts.
		</ContentTile>

		<ContentTile title="Telegram" icon="telegram" targetUrl="https://t.me/trading_protocol">
			Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news.
		</ContentTile>

		<ContentTile title="Newsletter" icon="newspaper" targetUrl="https://newsletter.tradingstrategy.ai/">
			Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.
		</ContentTile>

		<ContentTile title="YouTube" icon="youtube" targetUrl="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ">
			Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.
		</ContentTile>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 4.5rem;
	}

	main :global .media svg {
		width: 75%;
		max-width: 18rem;
	}

	section {
		grid-template-columns: repeat(auto-fit, minmax(21.5rem, 1fr));
		gap: var(--space-3xl);
	}

	@media (--viewport-md-up) {
		main {
			gap: 6.25rem;
		}
	}
</style>

<script lang="ts">
	import { Hero, ContentTile } from '$lib/components';
	import HeroImage from '$lib/assets/illustrations/communication-1.svg?raw';
</script>

<svelte:head>
	<title>Community</title>
	<meta name="description" content="Blog, Discord and discussion" />
</svelte:head>

<main>
	<Hero title="Community" image={HeroImage}>
		Join our community of expert traders, strategy developers and quants. Learn more about the Trading Strategy
		protocol, algorithmic trading and DeFi markets.
	</Hero>

	<div class="section-wrapper">
		<section class="ds-container">
			<h2>Follow us</h2>

			<ContentTile title="Blog" icon="reading" targetUrl="/blog">
				Subscribe to our blog where we provide protocol updates, industry insights and algo trading tips.
			</ContentTile>

			<ContentTile title="Twitter" icon="twitter" targetUrl="https://twitter.com/TradingProtocol">
				Follow us on Twitter for trading alerts, DeFi insight and protocol news.
			</ContentTile>

			<ContentTile title="YouTube" icon="youtube" targetUrl="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ">
				Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.
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
		</section>

		<section class="ds-container">
			<h2>Discuss & develop</h2>

			<ContentTile title="Discord chat" icon="discord" targetUrl="https://discord.gg/en8tW6MDtw">
				Join our expert community of traders, developers, and analysts and DeFi specialists.
			</ContentTile>

			<ContentTile title="GitHub" icon="github" targetUrl="https://github.com/tradingstrategy-ai/">
				Explore Trading Strategy open-source code on our GitHub repository.
			</ContentTile>

			<ContentTile
				title="Algorithm tutorials"
				icon="read-glasses"
				targetUrl="https://tradingstrategy.ai/docs/programming/code-examples/getting-started.html"
			>
				Learn how to write trading algorithms with our documentation and run backtests.
			</ContentTile>
		</section>
	</div>
</main>

<style>
	main {
		display: grid;
		gap: 2.5rem;
	}

	.section-wrapper {
		display: grid;
		gap: 4.5rem;
	}

	section {
		grid-template-columns: repeat(auto-fit, minmax(min(var(--container-width), 21.5rem), 1fr));
		gap: 2rem;
	}

	section h2 {
		grid-column: 1 / -1;
	}

	@media (--viewport-md-up) {
		.section-wrapper {
			gap: 6.25rem;
		}
	}
</style>

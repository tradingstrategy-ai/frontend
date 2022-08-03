<script lang="ts">
	import Hero from '$lib/components/Hero.svelte';
	import ContentTile from '$lib/components/ContentTile.svelte';
	import SocialImage from '$lib/assets/milano/social-media/social-media-discussion-1.svg?raw';
</script>

<svelte:head>
	<title>Community</title>
	<meta name="description" content="Blog, Discord and discussion" />
</svelte:head>

<main>
	<Hero title="Community" image={SocialImage}>
		Join our community of expert traders, strategy developersand quants. Learn more about the Trading Strategy protocol,
		algorithmic trading and DeFi markets.
	</Hero>

	<section class="ds-container">
		<h2>Follow us</h2>

		<ContentTile
			title="Blog"
			icon="newspaper"
			text="Subscribe to our blog where we provide protocol updates, industry insights and algo trading tips."
			targetUrl="/blog"
		/>

		<ContentTile
			title="Twitter"
			icon="twitter"
			text="Follow us on Twitter for trading alerts, DeFi insight and protocol news."
			targetUrl="https://twitter.com/TradingProtocol"
		/>

		<ContentTile
			title="YouTube"
			icon="youtube"
			text="Read and subscribe to our blog. Gain insights in decentralised trading and algorithmic trading."
			targetUrl="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
		/>

		<ContentTile
			title="LinkedIn"
			icon="linkedin"
			text="Read and subscribe to our blog. Gain insights in decentralised trading and algorithmic trading."
			targetUrl="https://www.linkedin.com/company/trading-strategy/"
		/>

		<ContentTile
			title="Telegram"
			icon="telegram"
			text="Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news."
			targetUrl="https://t.me/trading_protocol"
		/>

		<ContentTile
			title="Newsletter"
			icon="mail"
			text="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
			targetUrl="https://newsletter.tradingstrategy.ai/"
		/>
	</section>

	<section class="ds-container">
		<h2>Discuss & develop</h2>

		<ContentTile
			title="Discord chat"
			icon="discord"
			text="Join our expert community of traders, developers, and analysts and DeFi specialists."
			targetUrl="https://discord.gg/en8tW6MDtw"
		/>

		<ContentTile
			title="GitHub"
			icon="github"
			text="Explore Trading Strategy open-source code on our GitHub repository."
			targetUrl="https://github.com/tradingstrategy-ai/"
		/>

		<ContentTile
			title="Algorithm tutorials"
			icon="book"
			text="Learn how to write trading algorithms with our documentation and run backtests."
			targetUrl="https://tradingstrategy.ai/docs/programming/examples/getting-started.html"
		/>
	</section>
</main>

<style>
	section {
		grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
		gap: 2rem;
		padding-top: 2rem;
		padding-bottom: 2rem;
	}

	section h2 {
		grid-column: 1 / -1;
		font: var(--f-h3-medium);
	}

	@media (--viewport-md-up) {
		section {
			padding-top: 2.75rem;
			padding-bottom: 2.75rem;
		}

		section h2 {
			font: 600 var(--fs-heading-xl);
		}
	}

	@media (--viewport-lg-up) {
		section h2 {
			font: 600 var(--fs-heading-xl);
		}
	}
</style>

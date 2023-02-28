<script lang="ts">
	import heroImage from '$lib/assets/illustrations/communication-1.svg?raw';
	import { ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';
</script>

<ContentCardsTemplate pageTitle="Community" pageDescription="Blog, Discord and discussion">
	<HeroBanner
		slot="hero"
		image={heroImage}
		title="Community"
		subtitle="Join our community of expert traders, strategy developers and quants.<br /> Learn more about the Trading Strategy protocol, algorithmic trading and DeFi markets."
	/>

	<ContentCardsSection cols={3} title="Discuss & develop">
		<ContentCard
			ctaLabel="Join our server"
			icon="discord"
			title="Discord chat"
			href="https://discord.gg/en8tW6MDtw"
			description="Join our expert community of traders, developers, and analysts and DeFi specialists."
		/>
		<ContentCard
			ctaLabel="Browse code"
			icon="github"
			title="GitHub"
			href="https://github.com/tradingstrategy-ai/"
			description="Explore Trading Strategy open-source code on our GitHub repository."
		/>
		<ContentCard
			ctaLabel="Start tutorials"
			icon="read-glasses"
			title="Learn algorithmic trading"
			href="https://tradingstrategy.ai/docs/learn/index.html"
			description="Learn how to write trading algorithms with our learning resources collection."
		/>
	</ContentCardsSection>

	<ContentCardsSection cols={3} title="Follow us">
		<ContentCard
			ctaLabel="Read blog"
			icon="reading"
			title="Blog"
			href="/blog"
			description="Join our expert community of traders, developers, and analysts and DeFi specialists."
		/>
		<ContentCard
			ctaLabel="Follow us"
			icon="twitter"
			title="Twitter"
			href="https://twitter.com/TradingProtocol"
			description="Follow us on Twitter for trading alerts, DeFi insight and protocol news."
		/>
		<ContentCard
			ctaLabel="Subscribe to our channel"
			icon="youtube"
			title="YouTube"
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
			description="Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading."
		/>
		<ContentCard
			ctaLabel="Follow our company"
			icon="linkedin"
			title="LinkedIn"
			href="https://www.linkedin.com/company/trading-strategy/"
			description="Follow us on LinkedIn and join our community of traders, developers and quant experts."
		/>
		<ContentCard
			ctaLabel="Join our group"
			icon="telegram"
			title="Telegram"
			href="https://t.me/trading_protocol"
			description="Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news."
		/>
		<div style:display="contents" style:cursor="pointer">
			<ContentCard
				ctaLabel="Subscribe to newsletter"
				icon="newspaper"
				title="Newsletter"
				href="/newsletter"
				description="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
			/>
		</div>
	</ContentCardsSection>
</ContentCardsTemplate>

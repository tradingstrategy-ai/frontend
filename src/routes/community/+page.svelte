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
			href="https://discord.gg/en8tW6MDtw"
			iconName="discord"
			title="Discord chat"
			subtitle="Join our expert community of traders, developers, and analysts and DeFi specialists."
		/>
		<ContentCard
			href="https://github.com/tradingstrategy-ai/"
			iconName="github"
			title="GitHub"
			subtitle="Explore Trading Strategy open-source code on our GitHub repository."
		/>
		<ContentCard
			href="https://discord.gg/en8tW6MDtw"
			iconName="read-glasses"
			title="Algorithm tutorials"
			subtitle="Learn how to write trading algorithms with our documentation and run backtests."
		/>
	</ContentCardsSection>

	<ContentCardsSection cols={3} title="Follow us">
		<ContentCard
			href="/blog"
			iconName="reading"
			title="Blog"
			subtitle="Join our expert community of traders, developers, and analysts and DeFi specialists."
		/>
		<ContentCard
			href="https://twitter.com/TradingProtocol"
			iconName="twitter"
			title="Twitter"
			subtitle="Follow us on Twitter for trading alerts, DeFi insight and protocol news."
		/>
		<ContentCard
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
			iconName="youtube"
			title="YouTube"
			subtitle="Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading."
		/>
		<ContentCard
			href="https://www.linkedin.com/company/trading-strategy/"
			iconName="linkedin"
			title="LinkedIn"
			subtitle="Follow us on LinkedIn and join our community of traders, developers and quant experts."
		/>
		<ContentCard
			href="https://t.me/trading_protocol"
			iconName="telegram"
			title="Telegram"
			subtitle="Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news."
		/>
		<ContentCard
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
			iconName="newspaper"
			title="Newsletter"
			subtitle="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
		/>
	</ContentCardsSection>
</ContentCardsTemplate>

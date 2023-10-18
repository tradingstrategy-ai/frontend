<script lang="ts">
	import { discordUrl } from '$lib/config';
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
			icon="discord"
			title="Discord chat"
			description="Join our expert community of traders, developers, and analysts and DeFi specialists."
			ctaLabel="Join our server"
			href={discordUrl}
			target="_blank"
			rel="noreferrer"
		/>
		<ContentCard
			icon="github"
			title="GitHub"
			description="Explore Trading Strategy open-source code on our GitHub repository."
			ctaLabel="Browse code"
			href="https://github.com/tradingstrategy-ai/"
			target="_blank"
			rel="noreferrer"
		/>
		<ContentCard
			icon="read-glasses"
			title="Learn algorithmic trading"
			description="Learn how to write trading algorithms with our learning resources collection."
			ctaLabel="Start tutorials"
			href="https://tradingstrategy.ai/docs/learn/index.html"
		/>
	</ContentCardsSection>

	<ContentCardsSection cols={3} title="Follow us">
		<ContentCard
			icon="reading"
			title="Blog"
			description="Join our expert community of traders, developers, and analysts and DeFi specialists."
			ctaLabel="Read blog"
			href="/blog"
		/>
		<ContentCard
			icon="twitter"
			title="Twitter"
			description="Follow us on Twitter for trading alerts, DeFi insight and protocol news."
			ctaLabel="Follow us"
			href="https://twitter.com/TradingProtocol"
			target="_blank"
			rel="noreferrer"
		/>
		<ContentCard
			icon="youtube"
			title="YouTube"
			description="Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading."
			ctaLabel="Subscribe to our channel"
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
			target="_blank"
			rel="noreferrer"
		/>
		<ContentCard
			icon="linkedin"
			title="LinkedIn"
			description="Follow us on LinkedIn and join our community of traders, developers and quant experts."
			ctaLabel="Follow our company"
			href="https://www.linkedin.com/company/trading-strategy/"
			target="_blank"
			rel="noreferrer"
		/>
		<ContentCard
			icon="telegram"
			title="Telegram"
			description="Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news."
			ctaLabel="Join our group"
			href="https://t.me/trading_protocol"
			target="_blank"
			rel="noreferrer"
		/>
		<div style:display="contents" style:cursor="pointer">
			<ContentCard
				icon="newspaper"
				title="Newsletter"
				description="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
				ctaLabel="Subscribe to newsletter"
				href="/newsletter"
			/>
		</div>
	</ContentCardsSection>
</ContentCardsTemplate>

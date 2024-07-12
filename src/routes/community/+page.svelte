<script lang="ts">
	import { discordUrl } from '$lib/config';
	import heroImage from '$lib/assets/illustrations/communication-1.svg?raw';
	import { Button, ContentCard, ContentCardsSection, ContentCardsTemplate, HeroBanner } from '$lib/components';

	import IconDiscord from '~icons/local/discord';
	import IconGithub from '~icons/local/github';
	import IconReadGlasses from '~icons/local/read-glasses';
	import IconReading from '~icons/local/reading';
	import IconTwitter from '~icons/local/twitter';
	import IconYoutube from '~icons/local/youtube';
	import IconLinkedin from '~icons/local/linkedin';
	import IconTelegram from '~icons/local/telegram';
	import IconNewspaper from '~icons/local/newspaper';
</script>

<ContentCardsTemplate pageTitle="Community" pageDescription="Blog, Discord and discussion">
	<HeroBanner
		slot="hero"
		image={heroImage}
		title="Community"
		subtitle="Join our community of expert traders, strategy developers and quants.<br /> Learn more about the Trading Strategy protocol, algorithmic trading and DeFi markets."
	/>

	<ContentCardsSection cols={3} title="Discuss & develop">
		<ContentCard title="Discord chat" href={discordUrl} target="_blank" rel="noreferrer">
			<IconDiscord slot="icon" />
			<p>Join our expert community of traders, developers, and analysts and DeFi specialists.</p>
			<Button slot="cta" label="Join our server" />
		</ContentCard>
		<ContentCard title="GitHub" href="https://github.com/tradingstrategy-ai/" target="_blank" rel="noreferrer">
			<IconGithub slot="icon" />
			<p>Explore Trading Strategy open-source code on our GitHub repository.</p>
			<Button slot="cta" label="Browse code" />
		</ContentCard>
		<ContentCard
			title="Learn algorithmic trading"
			href="https://tradingstrategy.ai/docs/learn/index.html"
			rel="external"
		>
			<IconReadGlasses slot="icon" />
			<p>Learn how to write trading algorithms with our learning resources collection.</p>
			<Button slot="cta" label="Start tutorials" />
		</ContentCard>
	</ContentCardsSection>

	<ContentCardsSection cols={3} title="Follow us">
		<ContentCard title="Blog" href="/blog">
			<IconReading slot="icon" />
			<p>Join our expert community of traders, developers, and analysts and DeFi specialists.</p>
			<Button slot="cta" label="Read blog" />
		</ContentCard>
		<ContentCard title="Twitter" href="https://twitter.com/TradingProtocol" target="_blank" rel="noreferrer">
			<IconTwitter slot="icon" />
			<p>Follow us on Twitter for trading alerts, DeFi insight and protocol news.</p>
			<Button slot="cta" label="Follow us" />
		</ContentCard>
		<ContentCard
			title="YouTube"
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
			target="_blank"
			rel="noreferrer"
		>
			<IconYoutube slot="icon" />
			<p>Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.</p>
			<Button slot="cta" label="Subscribe to our channel" />
		</ContentCard>
		<ContentCard
			title="LinkedIn"
			href="https://www.linkedin.com/company/trading-strategy/"
			target="_blank"
			rel="noreferrer"
		>
			<IconLinkedin slot="icon" />
			<p>Follow us on LinkedIn and join our community of traders, developers and quant experts.</p>
			<Button slot="cta" label="Follow our company" />
		</ContentCard>
		<ContentCard title="Telegram" href="https://t.me/trading_protocol" target="_blank" rel="noreferrer">
			<IconTelegram slot="icon" />
			<p>Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news.</p>
			<Button slot="cta" label="Join our group" />
		</ContentCard>
		<ContentCard title="Newsletter" href="/newsletter">
			<IconNewspaper slot="icon" />
			<p>Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.</p>
			<Button slot="cta" label="Subscribe to newsletter" />
		</ContentCard>
	</ContentCardsSection>
</ContentCardsTemplate>

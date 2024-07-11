<!--

Where the user lands on his/her mobile after scanning the QR code
on the conference rolls.

-->
<script lang="ts">
	import { discordUrl } from '$lib/config';
	import { HeroBanner, ContentCard, ContentCardsSection, ContentCardsTemplate } from '$lib/components';
	import BrandMark from '$lib/assets/brand-mark.svg?raw';
	import IconDiscord from '~icons/local/discord';
	import IconTwitter from '~icons/local/twitter';
	import IconLinkedin from '~icons/local/linkedin';
	import IconTelegram from '~icons/local/telegram';
	import IconNewspaper from '~icons/local/newspaper';
	import IconYoutube from '~icons/local/youtube';
</script>

<ContentCardsTemplate
	pageTitle="Follow Trading Strategy"
	pageDescription="Follow us on our socials and join the discussion."
>
	<HeroBanner
		title="Follow Trading Strategy"
		image={BrandMark}
		slot="hero"
		subtitle="Follow us on our socials and join the discussion."
	/>
	<ContentCardsSection cols={3} title="">
		<ContentCard title="Discord chat" href={discordUrl} target="_blank" rel="noreferrer">
			<IconDiscord slot="icon" />
			<p>Join our expert community of traders, developers, and analysts and DeFi specialists.</p>
		</ContentCard>

		<ContentCard title="Twitter" href="https://twitter.com/TradingProtocol" target="_blank" rel="noreferrer">
			<IconTwitter slot="icon" />
			<p>Follow us on Twitter for trading alerts, DeFi insight and protocol news.</p>
		</ContentCard>

		<ContentCard
			title="LinkedIn"
			href="https://www.linkedin.com/company/trading-strategy/"
			target="_blank"
			rel="noreferrer"
		>
			<IconLinkedin slot="icon" />
			<p>Follow us on LinkedIn and join our community of traders, developers and quant experts.</p>
		</ContentCard>

		<ContentCard title="Telegram" href="https://t.me/trading_protocol" target="_blank" rel="noreferrer">
			<IconTelegram slot="icon" />
			<p>Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news.</p>
		</ContentCard>

		<ContentCard title="Newsletter" href="/newsletter">
			<IconNewspaper slot="icon" />
			<p>Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.</p>
		</ContentCard>

		<ContentCard
			title="YouTube"
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
			target="_blank"
			rel="noreferrer"
		>
			<IconYoutube slot="icon" />
			<p>Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.</p>
		</ContentCard>
	</ContentCardsSection>
</ContentCardsTemplate>

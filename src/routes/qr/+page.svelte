<!--

Where the user lands on his/her mobile after scanning the QR code
on the conference rolls.

-->
<script lang="ts">
	import { HeroBanner, ContentCard, ContentCardsSection, ContentCardsTemplate } from '$lib/components';
	import BrandMark from '$lib/assets/brand-mark.svg?raw';
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
		<ContentCard
			icon="discord"
			title="Discord chat"
			description="Join our expert community of traders, developers, and analysts and DeFi specialists."
			href="https://discord.gg/en8tW6MDtw"
		/>

		<ContentCard
			icon="twitter"
			title="Twitter"
			description="Follow us on Twitter for trading alerts, DeFi insight and protocol news."
			href="https://twitter.com/TradingProtocol"
		/>

		<ContentCard
			icon="linkedin"
			title="LinkedIn"
			description="Follow us on LinkedIn and join our community of traders, developers and quant experts."
			href="https://www.linkedin.com/company/trading-strategy/"
		/>

		<ContentCard
			icon="telegram"
			title="Telegram"
			description="Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news."
			href="https://t.me/trading_protocol"
		/>

		<ContentCard
			icon="newspaper"
			title="Newsletter"
			description="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
			href="/newsletter"
		/>

		<ContentCard
			icon="youtube"
			title="YouTube"
			description="Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading."
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
		/>
	</ContentCardsSection>
</ContentCardsTemplate>

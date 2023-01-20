<!--

Where the user lands on his/her mobile after scanning the QR code
on the conference rolls.

-->
<script lang="ts">
	import { Hero, ContentCard } from '$lib/components';
	import { toggleSubscribeDialog } from '$lib/newsletter/controller';
	import BrandMark from '$lib/assets/brand-mark.svg?raw';
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<ContentCardsTemplate
	heroImage={BrandMark}
	heroTitle="Follow Trading Strategy"
	heroSubtitle="Follow us on our socials and join the discussion."
	pageId="qr"
	pageTitle="Follow Trading Strategy"
	pageDescription="Follow us and discuss on social media"
	cols={3}
	contentCardsSections={data.contentCardsSections}
/>

<main>
	<Hero title="Follow Trading Strategy" image={BrandMark}>Follow us on our socials and join the discussion.</Hero>

	<section class="ds-container">
		<ContentCard
			iconName="discord"
			title="Discord chat"
			subtitle="Join our expert community of traders, developers, and analysts and DeFi specialists."
			href="https://discord.gg/en8tW6MDtw"
		/>

		<ContentCard
			iconName="twitter"
			title="Twitter"
			subtitle="Follow us on Twitter for trading alerts, DeFi insight and protocol news."
			href="https://twitter.com/TradingProtocol"
		/>

		<ContentCard
			iconName="linkedin"
			title="LinkedIn"
			subtitle="Follow us on LinkedIn and join our community of traders, developers and quant experts."
			href="https://www.linkedin.com/company/trading-strategy/"
		/>

		<ContentCard
			iconName="telegram"
			title="Telegram"
			subtitle="Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news."
			href="https://t.me/trading_protocol"
		/>

		<ContentCard
			iconName="newspaper"
			title="Newsletter"
			subtitle="Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights."
			on:click={toggleSubscribeDialog}
		/>

		<ContentCard
			iconName="youtube"
			title="YouTube"
			subtitle="Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading."
			href="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ"
		/>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 4.5rem;
	}
</style>

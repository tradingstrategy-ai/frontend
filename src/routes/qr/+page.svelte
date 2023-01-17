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
		<ContentCard title="Discord chat" icon="discord" targetUrl="https://discord.gg/en8tW6MDtw">
			Join our expert community of traders, developers, and analysts and DeFi specialists.
		</ContentCard>

		<ContentCard title="Twitter" icon="twitter" targetUrl="https://twitter.com/TradingProtocol">
			Follow us on Twitter for trading alerts, DeFi insight and protocol news.
		</ContentCard>

		<ContentCard title="LinkedIn" icon="linkedin" targetUrl="https://www.linkedin.com/company/trading-strategy/">
			Follow us on LinkedIn and join our community of traders, developers and quant experts.
		</ContentCard>

		<ContentCard title="Telegram" icon="telegram" targetUrl="https://t.me/trading_protocol">
			Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news.
		</ContentCard>

		<ContentCard title="Newsletter" icon="newspaper" on:click={toggleSubscribeDialog}>
			Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.
		</ContentCard>

		<ContentCard title="YouTube" icon="youtube" targetUrl="https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ">
			Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.
		</ContentCard>
	</section>
</main>

<style>
	main {
		display: grid;
		gap: 4.5rem;
	}
</style>

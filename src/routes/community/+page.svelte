<script lang="ts">
	import ContentCardsTemplate from '$lib/components/ContentCardsTemplate.svelte';
	import heroImage from '$lib/assets/illustrations/communication-1.svg?raw';

	const contentCardsSections = [
		{
			title: 'Discuss & develop',
			cards: [
				{
					href: 'https://discord.gg/en8tW6MDtw',
					iconName: 'discord',
					title: 'Discord chat',
					subtitle: 'Join our expert community of traders, developers, and analysts and DeFi specialists.'
				},
				{
					href: 'https://github.com/tradingstrategy-ai/',
					iconName: 'github',
					title: 'GitHub',
					subtitle: 'Explore Trading Strategy open-source code on our GitHub repository.'
				},
				{
					href: 'https://discord.gg/en8tW6MDtw',
					iconName: 'read-glasses',
					title: 'Algorithm tutorials',
					subtitle: 'Learn how to write trading algorithms with our documentation and run backtests.'
				}
			]
		},
		{
			title: 'Follow us',
			cards: [
				{
					href: '/blog',
					iconName: 'reading',
					title: 'Blog',
					subtitle: 'Join our expert community of traders, developers, and analysts and DeFi specialists.'
				},
				{
					href: 'https://twitter.com/TradingProtocol',
					iconName: 'twitter',
					title: 'Twitter',
					subtitle: 'Follow us on Twitter for trading alerts, DeFi insight and protocol news.'
				},
				{
					href: 'https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ',
					iconName: 'youtube',
					title: 'YouTube',
					subtitle: 'Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.'
				},
				{
					href: 'https://www.linkedin.com/company/trading-strategy/',
					iconName: 'linkedin',
					title: 'LinkedIn',
					subtitle: 'Follow us on LinkedIn and join our community of traders, developers and quant experts.'
				},
				{
					href: 'https://t.me/trading_protocol',
					iconName: 'telegram',
					title: 'Telegram',
					subtitle: 'Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news.'
				},
				{
					href: 'https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ',
					iconName: 'newspaper',
					title: 'Newsletter',
					subtitle: 'Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.'
				}
			]
		}
	];
</script>

<ContentCardsTemplate
	cols={3}
	{contentCardsSections}
	{heroImage}
	heroTitle="Community"
	heroSubtitle="Join our community of expert traders, strategy developers and quants.<br /> Learn more about the Trading Strategy protocol, algorithmic trading and DeFi markets."
	pageTitle="Community"
	pageDescription="Blog, Discord and discussion"
/>

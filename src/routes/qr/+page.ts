import type { PageLoad } from './$types';

export const load: PageLoad = () => {
	return {
		contentCardsSections: [
			{
				cards: [
					{
						href: 'https://discord.gg/en8tW6MDtw',
						iconName: 'discord',
						title: 'Discord chat',
						subtitle: 'Join our expert community of traders, developers, and analysts and DeFi specialists.'
					},
					{
						href: 'https://twitter.com/TradingProtocol',
						iconName: 'twitter',
						title: 'Twitter',
						subtitle: 'Follow us on Twitter for trading alerts, DeFi insight and protocol news.'
					},
					{
						href: 'https://www.linkedin.com/company/trading-strategy/',
						iconName: 'linkedin',
						title: 'LinkedIn',
						subtitle: 'Follow us on LinkedIn and join our community of traders, developers and quant experts.'
					},
					{
						href: '/newsletter',
						iconName: 'newspaper',
						title: 'Newsletter',
						subtitle: 'Subscribe to our newsletter and never miss protocol updates, trading tips, news and insights.'
					},
					{
						href: 'https://t.me/trading_protocol',
						iconName: 'telegram',
						title: 'Telegram',
						subtitle: 'Subscribe to our Telegram channel for trading alerts, DeFi insight and protocol news.'
					},
					{
						href: 'https://www.youtube.com/channel/UCXBQRclPxMY40n52-k3VhYQ',
						iconName: 'youtube',
						title: 'YouTube',
						subtitle: 'Subscribe to our Youtube channel and watch the latest videos on DeFi and algorithmic trading.'
					}
				]
			}
		],
		skipFooter: true
	};
};

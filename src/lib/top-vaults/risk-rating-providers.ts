/**
 * Third-party risk-rating providers displayed in vault listings.
 *
 * Each provider has a different score direction, so the listing can default
 * to the safest rated vaults without treating the numeric scores alike.
 */
export const riskRatingProviders = {
	core3: {
		name: 'CORE3',
		pageTitle: 'CORE3 risk ratings for DeFi vaults',
		website: 'https://core3.io/',
		logoUrl: 'https://core3.io/images/fav-icon-32.png',
		logoAlt: 'CORE3 logo',
		defaultDirection: 'asc' as const
	},
	xerberus: {
		name: 'Xerberus',
		pageTitle: 'Xerberus risk ratings for DeFi vaults',
		website: 'https://xerberus.io/',
		logoUrl: 'https://app.xerberus.io/favicon.ico',
		logoAlt: 'Xerberus logo',
		defaultDirection: 'desc' as const
	}
} as const;

export type RiskRatingProvider = keyof typeof riskRatingProviders;

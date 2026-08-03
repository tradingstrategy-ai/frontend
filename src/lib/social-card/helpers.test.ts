import { describe, expect, test } from 'vitest';
import { getBlockchainSocialLogoUrl, selectSocialCardImage, TRADING_STRATEGY_SOCIAL_IMAGE_PATH } from './helpers';

describe('selectSocialCardImage', () => {
	test('uses contextual logos in priority order before the site fallback', () => {
		const context = {
			curatorLogoUrl: '/curator.png',
			protocolLogoUrl: '/protocol.png',
			blockchainLogoUrl: '/blockchain.png',
			stablecoinLogoUrl: '/stablecoin.png'
		};

		expect(selectSocialCardImage(context)).toBe('/curator.png');
		expect(selectSocialCardImage({ ...context, curatorLogoUrl: undefined })).toBe('/protocol.png');
		expect(selectSocialCardImage({ ...context, curatorLogoUrl: undefined, protocolLogoUrl: undefined })).toBe(
			'/blockchain.png'
		);
		expect(
			selectSocialCardImage({
				...context,
				curatorLogoUrl: undefined,
				protocolLogoUrl: undefined,
				blockchainLogoUrl: undefined
			})
		).toBe('/stablecoin.png');
		expect(selectSocialCardImage({})).toBe(TRADING_STRATEGY_SOCIAL_IMAGE_PATH);
	});
});

describe('getBlockchainSocialLogoUrl', () => {
	test('only returns a card URL for a blockchain with a local logo', () => {
		expect(getBlockchainSocialLogoUrl('ethereum')).toBe('/social-card/blockchain/ethereum');
		expect(getBlockchainSocialLogoUrl('not-a-blockchain')).toBeUndefined();
	});
});

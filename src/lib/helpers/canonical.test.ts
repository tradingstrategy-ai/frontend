import { describe, expect, it } from 'vitest';
import { getCanonicalUrl } from './canonical';

describe('getCanonicalUrl', () => {
	it('drops the query string and hash', () => {
		const url = new URL(
			'https://tradingstrategy.ai/trading-view/polygon/uniswap-v3/oes-usdt-fee-100?timeBucket=1h#chart'
		);
		expect(getCanonicalUrl(url)).toBe('https://tradingstrategy.ai/trading-view/polygon/uniswap-v3/oes-usdt-fee-100');
	});

	it('keeps the path casing by default', () => {
		const url = new URL('https://tradingstrategy.ai/glossary/CAGR');
		expect(getCanonicalUrl(url)).toBe('https://tradingstrategy.ai/glossary/CAGR');
	});

	it('lowercases the path for address-keyed routes when asked', () => {
		const url = new URL(
			'https://tradingstrategy.ai/trading-view/ethereum/tokens/0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2'
		);
		expect(getCanonicalUrl(url, { lowercasePath: true })).toBe(
			'https://tradingstrategy.ai/trading-view/ethereum/tokens/0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'
		);
	});
});

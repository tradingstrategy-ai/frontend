/**
 * Misc exchange data helpers.
 */

export type ExchangeNameInfo = {
	name: string;
	version: number;
};

/**
 * Split the server side versioned name to name and version pat.
 * @param name
 */
export function parseExchangeName(name: string): ExchangeNameInfo {
	const match = name.match(/(.*) v?(\d)$/);
	if (match) {
		return {
			name: match[1],
			version: Number.parseInt(match[2])
		};
	} else {
		return {
			name: name,
			version: 1
		};
	}
}

export function exchangeTypeLabel(type: string) {
	switch (type) {
		case 'uniswap_v2':
			return 'Uniswap v2 like';
		case 'uniswap_v3':
			return 'Uniswap v3';
		default:
			return type;
	}
}

/**
 * Misc exchange data helpers.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type ExchangeDetails = Record<string, any>;
export type ExchangeIndexResponse = { exchanges: ExchangeDetails[] };

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

/**
 * Does the backend have no real name for this exchange?
 *
 * Unnamed factories are reported as `Unknown` or `Unknown 0x…` with the contract address
 * as the slug. Their pages render an "Unknown" title and are not worth indexing.
 */
export function isUnknownExchangeName(name: string | null | undefined): boolean {
	return !name || /^unknown(\s|$)/i.test(name.trim());
}

const exchangeLabels = {
	uniswap_v2: 'Uniswap v2 like',
	uniswap_v2_incompatible: 'Uniswap v2 (incompatible)',
	uniswap_v3: 'Uniswap v3'
};

export function exchangeTypeLabel(type: string) {
	return (exchangeLabels as Record<string, string>)[type] || type;
}

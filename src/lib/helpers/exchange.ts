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
	if (name.includes('v2')) {
		const coreName = name.split(' ')[0];
		return {
			name: coreName,
			version: 2
		};
	} else {
		return {
			name: name,
			version: 1
		};
	}
}

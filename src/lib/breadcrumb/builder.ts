export function buildBreadcrumbs(pagePath: string, readableNames) {
	// const readablePagesName = {
	//   'trading-view': 'Trading Data'
	// }

	function getReadableName(name: string) {
		return readableNames[name] || name;
	}

	const parts = pagePath.split('/').slice(1);

	return parts.map((pathPart, index, arr) => {
		return {
			url: '/' + arr.slice(0, index + 1).join('/'),
			name: getReadableName(pathPart)
		};
	});
}

export default {
	'trading-view': 'Trading data',
	backtesting: 'Historical data',
	exchanges: 'Exchanges',
	community: 'Community',
	about: 'About',
	ethereum: 'Ethereum',
	bsc: 'Binance Smart Chain',
	binance: 'Binance Smart Chain',
	polygon: 'Polygon',
	tokens: 'Tokens'
};

export const buildBreadcrumbs = (pagePath: string, readableNames) => {
	// const readablePagesName = {
	//   'trading-view': 'Trading Data'
	// }

	const getReadableName = (name: string) => {
		return readableNames[name] ? readableNames[name] : name;
	};

	const parts = pagePath.split('/').slice(1);

	let currentPath = '/';
	const breadCrumbs = parts.map((pathPart, index, arr) => {
		const lastElement = arr.length - 1 === index;
		currentPath = lastElement ? `${currentPath}${pathPart}` : `${currentPath}${pathPart}/`;
		return {
			url: currentPath,
			name: getReadableName(pathPart),
			linkActive: true,
			head: lastElement
		};
	});
	// { url: '/trading-view/exchanges',  name: 'exchanges', head: false  },
	return breadCrumbs;
};
const breadcrumbTranslations = {
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
export default breadcrumbTranslations;

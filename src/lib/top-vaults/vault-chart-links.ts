/**
 * The vault chart pages, in menu order.
 *
 * Rendered by the Charts dropdown in `VaultListingsSelector` and the in-page "See charts" row in
 * `ScatterPlotSelector`; the integration tests import the same list so they cannot drift from the UI.
 */
export const vaultChartLinks = [
	{ href: '/vaults/compare', label: 'Compare equity curves' },
	{ href: '/vaults/cumulative-tvl-apy', label: 'Total vault earnings' },
	{ href: '/vaults/yield-risk', label: 'Yield / Risk' },
	{ href: '/vaults/yield-protocol', label: 'Yield / Protocol' },
	{ href: '/vaults/yield-chain', label: 'Yield / Chain' },
	{ href: '/vaults/current-peak-tvl', label: 'Current / Peak TVL' },
	{ href: '/vaults/core3-risk', label: 'CORE3 risk' },
	{ href: '/vaults/historical-tvl-chain', label: 'Historical TVL by chain' },
	{ href: '/vaults/historical-tvl-stablecoin', label: 'Historical TVL by stablecoin' },
	{ href: '/vaults/historical-tvl-protocol', label: 'Historical TVL by vault protocol' },
	{ href: '/vaults/stablecoin-chain-heatmap', label: 'Stablecoin / Chain heatmap' }
] as const;

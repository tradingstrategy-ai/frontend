/**
 * Return URL for a lending reserve on a given chain and lending protocol
 */
export function lendingReserveUrl(chain: string, protocol: string, underlyingAsset: Address) {
	// only Aave V3 is currently supported
	if (protocol !== 'aave_v3') return undefined;

	const marketSlug = chain === 'ethereum' ? 'mainnet' : chain;
	const params = new URLSearchParams({
		underlyingAsset,
		marketName: `proto_${marketSlug}_v3`
	});
	return `https://app.aave.com/reserve-overview/?${params}`;
}

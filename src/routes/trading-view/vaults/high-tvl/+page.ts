const tvlThreshold = 2_000_000;

export async function load({ parent }) {
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		return (vault.current_nav ?? 0) >= tvlThreshold;
	});

	return {
		topVaults: { ...topVaults, vaults },
		tvlThreshold
	};
}

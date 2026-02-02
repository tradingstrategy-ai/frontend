const tvlThreshold = 10_000;

export async function load({ parent }) {
	const { topVaults } = await parent();

	// All stablecoin vaults, including ones with stuck funds and oracle problems
	const vaults = topVaults.vaults.filter((vault) => {
		return (vault.current_nav ?? 0) >= tvlThreshold;
	});

	return {
		topVaults: { ...topVaults, vaults },
		tvlThreshold
	};
}

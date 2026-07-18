import { getCachedTopVaults } from '$lib/top-vaults/cache';
import { fetchLatestTreasuryRate } from '$lib/reference-rates';

export async function load({ fetch }) {
	const [{ generated_at }, treasuryRate] = await Promise.all([
		getCachedTopVaults(fetch),
		fetchLatestTreasuryRate().catch(() => null)
	]);
	return { generatedAt: generated_at, treasuryRate };
}

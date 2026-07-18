import { fetchLatestFredValue, fetchLatestTreasuryRate } from '$lib/reference-rates';

export async function load() {
	const [savingsRate, treasuryRate] = await Promise.all([fetchLatestFredValue('SNDR'), fetchLatestTreasuryRate()]);
	return { savingsRate, treasuryRate };
}

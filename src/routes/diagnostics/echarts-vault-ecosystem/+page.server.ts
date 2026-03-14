import type { PageServerLoad } from './$types';
import { fetchLatestFredValue, fetchLatestTreasuryRate } from '$lib/reference-rates';

export const load: PageServerLoad = async () => {
	const [savingsRate, treasuryRate] = await Promise.all([fetchLatestFredValue('SNDR'), fetchLatestTreasuryRate()]);

	return {
		savingsRate,
		treasuryRate
	};
};
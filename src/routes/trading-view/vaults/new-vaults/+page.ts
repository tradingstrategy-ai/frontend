import { differenceInDays } from 'date-fns';

const maxAgeDays = 30;

export async function load({ parent }) {
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		const ageInDays = differenceInDays(new Date(), vault.start_date);
		return ageInDays <= maxAgeDays;
	});

	return {
		topVaults: { ...topVaults, vaults },
		maxAgeDays
	};
}

import { differenceInDays } from 'date-fns';

const AGE_THRESHOLD_DAYS = 90;

export async function load({ parent }) {
	const { topVaults } = await parent();

	const vaults = topVaults.vaults.filter((vault) => {
		const ageInDays = differenceInDays(new Date(), vault.start_date);
		return ageInDays <= AGE_THRESHOLD_DAYS;
	});

	return {
		topVaults: { ...topVaults, vaults }
	};
}

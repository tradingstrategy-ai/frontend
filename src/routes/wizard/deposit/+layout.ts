import type { EnzymeSmartContracts } from 'trade-executor/strategy/summary';
import { get } from 'svelte/store';
import { wizard } from 'wizard/store';
import { assertNotGeoBlocked } from '$lib/helpers/geo';

export async function load({ parent }) {
	const { admin, ipCountry } = await parent();
	assertNotGeoBlocked('strategies:deposit', ipCountry, admin);

	const title = 'Deposit tokens';

	let steps = [
		{ slug: 'introduction', label: 'Introduction' },
		{ slug: 'connect', label: 'Connect your wallet' },
		{ slug: 'balance', label: 'Wallet balance' },
		{ slug: 'tos', label: 'Terms of service' },
		{ slug: 'payment', label: 'Payment' },
		{ slug: 'success', label: 'Success' }
	];

	// skip "Terms of service" step if no terms_of_service contract
	const contracts: EnzymeSmartContracts = get(wizard).data!.contracts;
	if (!contracts.terms_of_service) {
		steps = steps.filter(({ slug }) => slug !== 'tos');
	}

	return { title, steps };
}

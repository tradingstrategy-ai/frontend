import { error } from '@sveltejs/kit';
import { getChain } from '$lib/helpers/chain.js';
import { getTimeSeries } from '$lib/top-vaults/metrics.remote.js';

export async function load({ params, parent }) {
	const { vaultId } = params;
	const { topVaults } = await parent();

	const vault = topVaults.vaults.find(({ id }) => id === vaultId);
	if (!vault) error(404, 'Vault not found');

	return {
		vault,
		chain: getChain(vault.chain_id),
		vaultPriceData: await getTimeSeries(vault.id)
	};
}

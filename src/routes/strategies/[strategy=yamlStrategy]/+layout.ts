/**
 * Load YAML strategy config and vault data from the top-vaults API.
 */
import { error } from '@sveltejs/kit';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { getChain } from '$lib/helpers/chain';

export async function load({ params, parent, fetch }) {
	const strategy = yamlStrategies.get(params.strategy);
	if (!strategy) error(404, 'Not found');

	const { admin } = await parent();
	if (!(admin || strategy.tags.includes('live'))) error(401, 'Unauthorized');

	const topVaults = await fetchTopVaults(fetch);
	const vaultInfo = topVaults.vaults.find((v) => v.vault_slug === strategy.vault_slug);

	const chain = getChain(strategy.chain_id);

	return { strategy, vaultInfo, chain };
}

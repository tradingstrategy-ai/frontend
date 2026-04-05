/**
 * Load YAML strategy config and vault data from the top-vaults API.
 */
import { error } from '@sveltejs/kit';
import { backtestHtml } from '$lib/strategies/yaml/backtest-loader';
import { yamlStrategies } from '$lib/strategies/yaml/loader';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { getChain } from '$lib/helpers/chain';

function getAgeSeconds(dateValue: Date | string | null | undefined) {
	if (!dateValue) return null;

	const parsed = new Date(dateValue);
	if (Number.isNaN(parsed.valueOf())) return null;

	return Math.max(0, Math.floor((Date.now() - parsed.valueOf()) / 1000));
}

export async function load({ params, parent, fetch }) {
	const strategy = yamlStrategies.get(params.strategy);
	if (!strategy) error(404, 'Not found');

	const { admin } = await parent();
	if (!(admin || strategy.tags.includes('live'))) error(401, 'Unauthorized');

	const topVaults = await fetchTopVaults(fetch);
	const vaultInfo = topVaults.vaults.find((v) => v.address === strategy.vault_address);

	const chain = getChain(strategy.chain_id);

	const backtestAvailable = backtestHtml.has(params.strategy);

	return {
		strategy,
		vaultInfo,
		chain,
		backtestAvailable,
		debugFreshness: {
			renderedAt: new Date().toISOString(),
			topVaultsFeed: {
				generatedAt: new Date(topVaults.generated_at).toISOString(),
				ageSeconds: getAgeSeconds(topVaults.generated_at)
			},
			vaultSummary: vaultInfo
				? {
						vaultId: vaultInfo.id,
						lastUpdatedAt: vaultInfo.last_updated_at ?? vaultInfo.end_date ?? null,
						source: 'top-vaults feed summary'
					}
				: null,
			vaultChart: vaultInfo
				? {
						endpoint: `/trading-view/vaults/${vaultInfo.id}/metrics`,
						cacheNote: 'Fetched client-side after hydration; no frontend SWR cache in app code.'
					}
				: null
		}
	};
}

import { error } from '@sveltejs/kit';
import { fetchTopVaultsRaw } from './server-config';
import { type TopVaults, topVaultsSchema } from './schemas';
import { normaliseKinexysVaultDenomination, normaliseVaultProtocolDisplayName } from './helpers';

function getSafeErrorSummary(errorValue: unknown): string {
	if (errorValue instanceof Error) {
		return `${errorValue.name}: ${errorValue.message}`;
	}
	return 'Unknown error';
}

export async function fetchTopVaults(fetch: Fetch): Promise<TopVaults> {
	try {
		const raw = await fetchTopVaultsRaw(fetch);
		const data = topVaultsSchema.parse(raw);

		return {
			...data,
			vaults: data.vaults.map((vault) => normaliseVaultProtocolDisplayName(normaliseKinexysVaultDenomination(vault)))
		};
	} catch (e) {
		if (e && typeof e === 'object' && 'status' in e) throw e;
		console.error(`Failed to fetch top vaults: ${getSafeErrorSummary(e)}`);
		throw error(503, 'Top vaults service not configured');
	}
}

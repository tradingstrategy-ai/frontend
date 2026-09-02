import type { UTCTimestamp } from 'lightweight-charts';
import { error, json } from '@sveltejs/kit';
import { queryVaultPriceRows } from '$lib/server/top-vaults/vault-price-series';

async function getPriceAndTvlData(vaultId: string) {
	try {
		const rows = await queryVaultPriceRows([vaultId], { includeVaultMetrics: true });
		return rows.map(
			({ timestamp, sharePrice, totalAssets, utilisation }) =>
				[timestamp as UTCTimestamp, sharePrice, totalAssets, utilisation ?? null] as [
					UTCTimestamp,
					number,
					number,
					number | null
				]
		);
	} catch (e) {
		console.error(`Error loading price data for vault <${vaultId}>`);
		const { stack } = e as Error;
		error(500, {
			message: `Error loading vault data for vault id <${vaultId}>`,
			stack: stack ? [stack] : undefined
		});
	}
}

export async function GET({ params }) {
	const rows = await getPriceAndTvlData(params.vault);

	const price: [UTCTimestamp, number][] = [];
	const tvl: [UTCTimestamp, number][] = [];
	const utilisation: [UTCTimestamp, number][] = [];

	for (const [ts, p, t, u] of rows) {
		price.push([ts, p]);
		tvl.push([ts, t]);
		if (u !== null) {
			utilisation.push([ts, u]);
		}
	}

	return json({ price, tvl, utilisation });
}

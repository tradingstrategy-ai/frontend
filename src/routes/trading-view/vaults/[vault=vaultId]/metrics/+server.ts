import type { UTCTimestamp } from 'lightweight-charts';
import { error, json } from '@sveltejs/kit';
import { DuckDBConnection } from '@duckdb/node-api';

// TODO: move to env var / config
const parquetFile = 'data/cleaned-vault-prices-1h.parquet';

async function getPriceAndTvlData(vaultId: string) {
	const connection = await DuckDBConnection.create();

	try {
		const reader = await connection.runAndReadAll(
			`SELECT EXTRACT(EPOCH FROM timestamp) as ts, share_price, total_assets
       FROM parquet_scan($parquetFile)
       WHERE id = $vaultId
       ORDER BY timestamp`,
			{ parquetFile, vaultId }
		);
		return reader.getRows() as [UTCTimestamp, number, number][];
	} catch (e) {
		console.error(`Error loading data from ${parquetFile} for vault <${vaultId}>`);
		const { stack } = e as Error;
		error(500, {
			message: `Error loading vault data for vault id <${vaultId}>`,
			stack: stack ? [stack] : undefined
		});
	} finally {
		connection.closeSync();
	}
}

export async function GET({ params }) {
	const rows = await getPriceAndTvlData(params.vault);

	const price: [UTCTimestamp, number][] = [];
	const tvl: [UTCTimestamp, number][] = [];

	for (const [ts, p, t] of rows) {
		price.push([ts, p]);
		tvl.push([ts, t]);
	}

	return json({ price, tvl });
}

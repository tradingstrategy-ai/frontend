import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DuckDBConnection } from '@duckdb/node-api';
import { queryVaultPriceRows } from './vault-price-series';

describe('queryVaultPriceRows', () => {
	test('queries several vault histories with optional metrics from one parquet file', async () => {
		const directory = await mkdtemp(join(tmpdir(), 'vault-price-series-'));
		const parquetFile = join(directory, 'prices.parquet');
		const connection = await DuckDBConnection.create();

		try {
			await connection.run(`
				CREATE TABLE prices (
					id VARCHAR,
					timestamp TIMESTAMP,
					share_price DOUBLE,
					total_assets DOUBLE,
					utilisation DOUBLE
				);
				INSERT INTO prices VALUES
					('vault-b', '2026-01-02 00:00:00', 2.1, 210, 2.5),
					('vault-a', '2026-01-02 00:00:00', 1.1, 110, 0.8),
					('vault-a', '2026-01-01 00:00:00', 1.0, 100, 0.7),
					('not-selected', '2026-01-01 00:00:00', 9, 900, 0.9);
				COPY prices TO '${parquetFile.replaceAll("'", "''")}' (FORMAT PARQUET);
			`);
		} finally {
			connection.closeSync();
		}

		try {
			const rows = await queryVaultPriceRows(['vault-b', 'vault-a'], {
				includeVaultMetrics: true,
				parquetFile
			});

			expect(rows).toEqual([
				{
					id: 'vault-a',
					timestamp: Date.UTC(2026, 0, 1) / 1000,
					sharePrice: 1,
					totalAssets: 100,
					utilisation: 0.7
				},
				{
					id: 'vault-a',
					timestamp: Date.UTC(2026, 0, 2) / 1000,
					sharePrice: 1.1,
					totalAssets: 110,
					utilisation: 0.8
				},
				{
					id: 'vault-b',
					timestamp: Date.UTC(2026, 0, 2) / 1000,
					sharePrice: 2.1,
					totalAssets: 210,
					utilisation: null
				}
			]);
		} finally {
			await rm(directory, { recursive: true, force: true });
		}
	});
});

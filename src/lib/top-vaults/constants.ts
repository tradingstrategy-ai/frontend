// src/lib/top-vaults/constants.ts

/**
 * Parquet file name for hourly vault price and TVL history.
 * Used both as a local file path on the server and as the remote filename in download URLs.
 */
export const VAULT_PRICES_PARQUET = 'cleaned-vault-prices-1h.parquet';

/**
 * Local disk path prefix used when reading the parquet file with DuckDB.
 */
export const VAULT_PRICES_PARQUET_PATH = `data/${VAULT_PRICES_PARQUET}`;

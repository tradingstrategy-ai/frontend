# Vault data optimisation status

The migration away from sending the complete top-vaults export to normal browser pages is implemented. The canonical architecture and configuration are documented in [Vault data sources](vault-data-source.md); listing pagination is documented in [Vault listing pagination](vault-listings.md).

## Current delivery model

- Server-only code reads `top_vaults_by_chain.json` from private R2 or `TS_PRIVATE_TOP_VAULTS_URL`, validates and normalises it, and keeps a one-hour in-memory cache.
- Vault listings render up to 125 server-filtered and server-sorted records initially, followed by continuation responses of up to 50 records.
- Vault detail pages receive one matched full record.
- Chart pages receive route-specific points, traces, groups, or aggregates calculated from the complete server-cached dataset.
- The landing page receives five slim vault records and calculated aggregates; its lazy ecosystem chart uses the all-vault `SlimVaultInfo` response from `/top-vaults/chart-data`.
- Strategy pages receive derived listing data, one matched YAML-strategy vault, or position-matched vault records.
- The chain overview receives only the tracked vault count, latest indexed block, and latest update time for the chain IDs represented by its route slug.

## Intentional exceptions

The authenticated vault-metadata dataset download and the allow-listed public sample are file-download products. They intentionally serve JSON files and are not application page-data paths.

Individual listing and detail responses still use the full `VaultInfo` record shape. Reducing fields within those bounded responses is a separate optimisation and is not required to keep the complete export server-side.

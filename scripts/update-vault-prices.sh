#!/bin/sh
#
# Update vault price data Parquet file.
#
# Needed to render equity curves for vaults.
#
# See https://web3-ethereum-defi.tradingstrategy.ai/api/vault/_autosummary_vault/eth_defi.vault.vaultdb#module-eth_defi.vault.vaultdb 
# for different vault database files.
#

cp ~/.tradingstrategy/vaults/cleaned-vault-prices-1h.parquet ./data/cleaned-vault-prices-1h.parquet


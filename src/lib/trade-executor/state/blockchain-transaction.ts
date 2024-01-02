/**
 * zod schemas for blockchain transactions
 *
 * Based on Python classes found in:
 * https://github.com/tradingstrategy-ai/trade-executor/blob/master/tradeexecutor/state/blockhain_transaction.py
 */
import { z } from 'zod';
import { blockNumber, chainId, count, decimal, hexString, hexEncodedData, unixTimestamp } from './utility-types';

export const blockchainTransactionType = z.enum(['hot_wallet', 'enzyme_vault', 'simulated']);

export const blockchainAssetDeltaSchema = z.object({
	asset: hexString,
	raw_amount: decimal
});

export const blockchainTransactionSchema = z.object({
	type: blockchainTransactionType,
	chain_id: chainId.nullish(),
	from_address: hexString.nullish(),
	contract_address: hexString.nullish(),
	function_selector: z.string().nullish(),
	transaction_args: hexEncodedData.nullish(),
	wrapped_function_selector: z.string().nullish(),
	wrapped_args: hexEncodedData.nullish(),
	tx_hash: hexString.nullish(),
	nonce: count,
	details: z.record(z.any()).nullish(),
	signed_bytes: hexString.nullish(),
	signed_tx_object: hexEncodedData.nullish(),
	broadcasted_at: unixTimestamp.nullish(),
	included_at: unixTimestamp.nullish(),
	block_number: blockNumber.nullish(),
	block_hash: hexString.nullish(),
	status: z.boolean().nullish(),
	realised_gas_units_consumed: z.number().int().nonnegative().nullish(),
	realised_gas_price: z.number().int().nonnegative().nullish(),
	revert_reason: z.string().nullish(),
	stack_trace: z.string().nullish(),
	asset_deltas: blockchainAssetDeltaSchema.array(),
	args: z.any().array(),
	other: z.record(z.any()),
	notes: z.string()
});
export type BlockchainTransaction = z.infer<typeof blockchainTransactionSchema>;

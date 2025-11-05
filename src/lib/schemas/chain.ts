import { z } from 'zod';
import { isoDateTime } from './utility';
import { chainId, blockNumber } from '$lib/eth-defi/schemas/core';

export const chainDetailsSchema = z.object({
	chain_name: z.string(),
	chain_slug: z.string(),
	chain_id: chainId,
	chain_logo: z.url().nullable(),
	chain_explorer: z.url(),
	homepage: z.url(),
	exchanges: z.int().nonnegative(),
	pairs: z.int().nonnegative(),
	tracked_pairs: z.int().nonnegative(),
	tokens: z.int().nonnegative().nullable(),
	minute_candles: z.int().nonnegative(),
	start_block: blockNumber,
	end_block: blockNumber,
	last_swap_at: isoDateTime
});
export type ChainDetails = z.infer<typeof chainDetailsSchema>;

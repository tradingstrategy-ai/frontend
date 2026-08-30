import { json, error } from '@sveltejs/kit';
import { z } from 'zod';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

const requestSchema = z
	.object({
		vaultIds: z.array(z.string().trim().min(1).max(200)).max(100).default([]),
		vaultAddresses: z
			.array(
				z.object({
					chainId: z.number().int(),
					address: z.string().trim().min(1).max(100)
				})
			)
			.max(100)
			.default([])
	})
	.refine(({ vaultIds, vaultAddresses }) => vaultIds.length + vaultAddresses.length > 0);

/** Return only the vault records referenced by a strategy's positions. */
export async function POST({ fetch, request }) {
	const parsed = requestSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) error(400, 'Invalid vault lookup request');

	const vaultIds = new Set(parsed.data.vaultIds);
	const vaultAddresses = new Set(
		parsed.data.vaultAddresses.map(({ chainId, address }) => `${chainId}:${address.toLowerCase()}`)
	);
	const { vaults } = await getCachedTopVaults(fetch);
	const matches = vaults.filter(
		(vault) => vaultIds.has(vault.id) || vaultAddresses.has(`${vault.chain_id}:${vault.address.toLowerCase()}`)
	);

	return json(
		{ vaults: matches },
		{
			headers: { 'cache-control': 'private, no-store' }
		}
	);
}

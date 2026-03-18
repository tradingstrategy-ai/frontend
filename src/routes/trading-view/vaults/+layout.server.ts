import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function load({ fetch }) {
	const { generated_at } = await getCachedTopVaults(fetch);
	return { generatedAt: generated_at };
}

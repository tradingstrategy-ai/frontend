import { json } from '@sveltejs/kit';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { type SlimVaultInfo, slimVaultKeys } from '$lib/top-vaults/schemas';

function slimVault(vault: Record<string, unknown>): SlimVaultInfo {
	const slim = {} as Record<string, unknown>;
	for (const key of slimVaultKeys) {
		slim[key] = vault[key as string];
	}
	return slim as SlimVaultInfo;
}

export async function GET({ fetch, setHeaders }) {
	setHeaders({ 'cache-control': 'public, max-age=1800' });
	const { vaults } = await fetchTopVaults(fetch);
	return json({ vaults: vaults.map(slimVault) });
}

import { json } from '@sveltejs/kit';
import { fetchTopVaults } from '$lib/top-vaults/client';
import { slimVault } from '$lib/top-vaults/helpers';

export async function GET({ fetch, setHeaders }) {
	setHeaders({ 'cache-control': 'public, max-age=1800' });
	const { vaults } = await fetchTopVaults(fetch);
	return json({ vaults: vaults.map(slimVault) });
}

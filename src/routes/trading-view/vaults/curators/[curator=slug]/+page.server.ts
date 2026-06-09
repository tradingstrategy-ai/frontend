import { error } from '@sveltejs/kit';
import { getCachedTopVaults } from '$lib/top-vaults/cache';

export async function load({ params, fetch }) {
	const { curator } = params;
	const { curators } = await getCachedTopVaults(fetch);

	const curatorInfo = curators[curator];
	if (!curatorInfo) error(404, 'Curator not found');

	return {
		curatorSlug: curator,
		curatorName: curatorInfo.name,
		curator: curatorInfo
	};
}

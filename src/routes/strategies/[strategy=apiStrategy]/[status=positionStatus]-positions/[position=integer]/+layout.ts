import { error } from '@sveltejs/kit';
import { getTradingPositionInfo } from 'trade-executor/models/position-info';
import { topVaultsSchema } from '$lib/top-vaults/schemas';
import { getPositionVault } from '../vault-sparklines';

export async function load({ params, parent, fetch }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { position: id, status } = params;
	const { state } = await parent();

	const position = getTradingPositionInfo(state, status, id);

	if (!position) {
		error(404, 'Not found');
	}

	const positionVault = await loadPositionVault(fetch, position);

	return {
		breadcrumbs: { [id]: `Position #${id}` },
		position,
		positionVault,
		status,
		skipSideNav: true
	};
}

async function loadPositionVault(fetch: Fetch, position: NonNullable<ReturnType<typeof getTradingPositionInfo>>) {
	if (!position.pair.isVault) return null;

	try {
		const response = await fetch('/top-vaults/all-data');
		if (!response.ok) throw new Error(`Failed to fetch top vaults: ${response.status}`);

		const topVaults = topVaultsSchema.parse(await response.json());
		return getPositionVault(position, topVaults.vaults) ?? null;
	} catch (error) {
		console.warn('Failed to resolve vault about data for position page', error);
		return null;
	}
}

import { error, redirect } from '@sveltejs/kit';
import { positionStatus } from 'trade-executor/schemas/position';
import { getTradingPositionInfo } from 'trade-executor/models/position-info';
import { fetchPositionVaults, getPositionVault } from '../vault-sparklines';

export async function load({ params, parent, fetch, url }) {
	// status can be `open`, `closed` or `frozen` (see params/positionStatus.ts)
	const { position: id, status } = params;
	const { state } = await parent();

	const position = getTradingPositionInfo(state, status, id);

	if (!position) {
		// positions move from open (or frozen) to closed, so links to the old status keep
		// working: send them to the status the position has now
		const current = positionStatus.options.find((other) => getTradingPositionInfo(state, other, id));
		if (current) {
			redirect(301, url.pathname.replace(`/${status}-positions/`, `/${current}-positions/`) + url.search);
		}
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
		return getPositionVault(position, await fetchPositionVaults(fetch, [position])) ?? null;
	} catch (error) {
		console.warn('Failed to resolve vault about data for position page', error);
		return null;
	}
}

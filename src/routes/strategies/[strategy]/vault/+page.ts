import { error } from '@sveltejs/kit';

export async function load({ parent }) {
	const { chain, strategy } = await parent();
	const onChainData = strategy.on_chain_data;

	if (onChainData.asset_management_mode !== 'enzyme') {
		error(404, 'Not found');
	}

	if (!chain) {
		error(503, {
			message: 'Service Unavailable',
			stack: ['Missing chain configuration']
		});
	}

	return { chain, onChainData };
}

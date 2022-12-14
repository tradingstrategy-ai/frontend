import type { PageLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';

const map = {
	'decision-making': 'decision-making',
	instance: 'status',
	logs: 'logs',
	performance: 'performance',
	'open-positions': 'open-positions',
	source: 'source'
};

// Temporary hack - redirect pages from old nav to /strategies equivalent
export const load: PageLoad = ({ params }) => {
	const newStrategyPage = map[params.other_page];
	if (newStrategyPage) {
		throw redirect(301, `/strategies/${params.strategy_id}/${newStrategyPage}`);
	} else {
		throw error(404, 'Not Found');
	}
};

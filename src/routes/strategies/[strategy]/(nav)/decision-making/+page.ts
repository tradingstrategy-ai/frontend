/**
 * Fetch the strategy decision making visualisation.
 */
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';

/**
 * Generate a variant of decision making status image URL for both color schemes.
 */
export const load: PageLoad = async ({ params, parent }) => {
	const { strategy } = await parent();

	const imageUrls: Record<string, string> = {};
	const type = 'large';

	for (let theme of ['light', 'dark']) {
		const encoded = new URLSearchParams({ theme, type });
		const url = `${strategy.url}/visualisation?${encoded}`;
		imageUrls[theme] = url;
	}

	return {
		imageUrls,
		breadcrumbs: { 'decision-making': 'Decision making' }
	};
};

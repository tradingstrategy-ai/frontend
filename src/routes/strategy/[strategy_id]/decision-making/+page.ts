/**
 * Fetch the strategy decision making visualisation.
 */
import type { PageLoad } from './$types';
import { error } from '@sveltejs/kit';
import { publicApiError } from '$lib/helpers/publicApiError';
import { getConfiguredStrategyById } from 'trade-executor-frontend/strategy/configuration';

/**
 * Generate a variant of decision making status image URL for both color schemes.
 */
export const load: PageLoad = async ({ params, fetch }) => {
	const strategy = getConfiguredStrategyById(params.strategy_id);
	if (!strategy) {
		throw error(500, `Strategy not loaded: ${params.strategy_id}`);
	}

  const images: { [key: string]: Blob; } = {};
  const size = "large";

  for(let theme of ["light", "dark"]) {
    const encoded = new URLSearchParams({ theme, size });
    const url = `${strategy.url}/visualisation?${encoded}`;
    images[theme] = url;
  }

	return {
		imageUrls: images
	};
};

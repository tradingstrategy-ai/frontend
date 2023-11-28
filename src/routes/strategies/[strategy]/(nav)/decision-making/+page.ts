/**
 * Fetch the strategy decision making visualisation.
 *
 * Generate a variant of decision making status image URL for both color schemes.
 */
import { getConfiguredStrategyById } from 'trade-executor/strategy/configuration';

export async function load({ params }) {
	const { url } = getConfiguredStrategyById(params.strategy)!;

	const imageUrls: Record<string, string> = {};
	const type = 'large';

	for (let theme of ['light', 'dark']) {
		const encoded = new URLSearchParams({ theme, type });
		imageUrls[theme] = `${url}/visualisation?${encoded}`;
	}

	return { imageUrls };
}

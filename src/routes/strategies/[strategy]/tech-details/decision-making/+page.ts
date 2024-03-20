/**
 * Fetch the strategy decision making visualisation.
 *
 * Generate a variant of decision making status image URL for both color schemes.
 */
import { configuredStrategies } from 'trade-executor/strategy/configuration';

export async function load({ params }) {
	const strategy = configuredStrategies.get(params.strategy)!;

	const imageUrls: Record<string, string> = {};

	for (let theme of ['light', 'dark']) {
		const encoded = new URLSearchParams({ theme, type: 'large' });
		imageUrls[theme] = `${strategy.url}/visualisation?${encoded}`;
	}

	return { imageUrls };
}

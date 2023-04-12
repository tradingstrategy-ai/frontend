/**
 * Fetch the strategy decision making visualisation.
 *
 * Generate a variant of decision making status image URL for both color schemes.
 */
export async function load({ parent }) {
	const { strategy } = await parent();

	const imageUrls: Record<string, string> = {};
	const type = 'large';

	for (let theme of ['light', 'dark']) {
		const encoded = new URLSearchParams({ theme, type });
		const url = `${strategy.url}/visualisation?${encoded}`;
		imageUrls[theme] = url;
	}

	return { imageUrls };
}

/**
 * See price.css
 *
 * @param priceChange Price change as percents
 */
export function determinePriceChangeClass(priceChange?: number | null): string {
	if (!priceChange) {
		return ''; // Data not loaded
	}

	if (priceChange > 0) {
		return 'bullish';
	} else {
		return 'bearish';
	}
}

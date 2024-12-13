/**
 * See price.css
 *
 * @param priceChange Price change as percents
 */
export function determinePriceChangeClass(priceChange?: number | null): string {
	if (!priceChange) {
		return 'normal'; // Data not loaded or 0
	}

	if (priceChange > 0) {
		return 'bullish';
	} else {
		return 'bearish';
	}
}

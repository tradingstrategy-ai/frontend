/**
 * See price.css
 *
 * @param priceChange Price change as percents
 */
export function determinePriceChangeClass(priceChange?: number | null): string {
	if (!priceChange) {
		return 'price-change-black'; // Data not loaded
	}

	if (priceChange > 0) {
		return 'price-change-green';
	} else {
		return 'price-change-red';
	}
}

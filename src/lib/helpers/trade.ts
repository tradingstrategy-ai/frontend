/**
 * Determine trade type ('Buy' vs. 'Sell') based on planned_quantity
 *
 */
export function tradeType({ planned_quantity }: { planned_quantity: number }) {
	return planned_quantity > 0 ? 'Buy' : 'Sell';
}

/**
 * Determine trade direction ('Buy' vs. 'Sell') based on planned_quantity
 *
 */
export function tradeDirection(trade: any) {
	const quantity = Number.parseFloat(trade?.planned_quantity);
	if (!Number.isFinite(quantity)) return;
	return quantity > 0 ? 'Buy' : 'Sell';
}

/**
 *
 * @param trade Trade object
 * @returns String 'Buy' or 'Sell'
 */
export function tradeType(trade) {
	return trade.planned_quantity > 0 ? 'Buy' : 'Sell';
}

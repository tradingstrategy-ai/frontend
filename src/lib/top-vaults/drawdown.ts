/**
 * Compute drawdown time series from share price data.
 * Drawdown at each point = (price - running_peak) / running_peak.
 * Values are always <= 0.
 */
export function computeDrawdownSeries(priceData: [number, number][]): [number, number][] {
	let peak = -Infinity;
	return priceData.map(([ts, price]) => {
		if (price > peak) peak = price;
		const drawdown = peak > 0 ? (price - peak) / peak : 0;
		return [ts, drawdown];
	});
}

/**
 * Track the worst peak-to-trough loss reached by each timestamp.
 * Recovery and new price highs do not erase an earlier maximum drawdown.
 * @param drawdownData Drawdowns for the selected period, in chronological order.
 */
export function computeMaxDrawdownSeries(drawdownData: [number, number][]): [number, number][] {
	let maxDrawdown = 0;
	return drawdownData.map(([ts, drawdown]) => {
		maxDrawdown = Math.min(maxDrawdown, drawdown);
		return [ts, maxDrawdown];
	});
}

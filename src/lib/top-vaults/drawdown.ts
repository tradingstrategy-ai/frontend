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

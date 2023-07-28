// we need move needle 0.25% before calling it moving
export const PROFITABILITY_THRESHOLD = 0.0025;

/**
 * Determine profitability above/below threshold
 * returns -1 (loss) | 0 (neither) | +1 (profit)
 *
 */
export function determineProfitability(value: number | null | undefined): number {
	if (!value || Math.abs(value) < PROFITABILITY_THRESHOLD) {
		return 0;
	}
	return Math.sign(value);
}

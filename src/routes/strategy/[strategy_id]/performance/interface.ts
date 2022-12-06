/**
 * Feed data to different charts;
 */
export interface TimeSeries {
	x: Date[];
	y: number[];
	yLabel?: string;

	// Axis range mode for Plotly
	// See https://plotly.com/javascript/axes/#nonnegative-tozero-and-normal-rangemode for options
	yRangeMode?: string;
}

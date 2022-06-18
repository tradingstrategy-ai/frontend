/**
 * Custom Volume Underlay study. See:
 * https://documentation.chartiq.com/tutorial-Using%20and%20Customizing%20Studies%20-%20Creating%20New%20Studies.html
 */
import colors from '$lib/colors';

export function volumeStudy(CIQ) {
	return {
		name: 'Volume Underlay',
		seriesFN: CIQ.Studies.createVolumeChart,
		calculateFN: CIQ.Studies.calculateVolume,
		inputs: {},
		outputs: {
			'Up Volume': colors.bullish,
			'Down Volume': colors.bearish
		},
		parameters: { widthFactor: 0.95 },
		range: '0 to max',
		yAxis: {
			ground: true,
			initialMarginTop: 0,
			position: 'none',
			heightFactor: 0.25
		},
		underlay: true
	};
}

export function liquidityStudy(CIQ) {
	return {
		name: 'Liquidity AR',
		seriesFN: CIQ.Studies.displaySeriesAsHistogram,
		inputs: { HistogramType: 'stacked' },
		outputs: {
			av: colors.bullish,
			rv: colors.bearish
		},
		parameters: { widthFactor: 0.95 },
		range: '0 to max',
		yAxis: {
			ground: true,
			initialMarginTop: 0,
			position: 'none',
			heightFactor: 0.5
		},
		underlay: true
	};
}

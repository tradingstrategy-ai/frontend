/**
 * Custom Volume Underlay study. See:
 * https://documentation.chartiq.com/tutorial-Using%20and%20Customizing%20Studies%20-%20Creating%20New%20Studies.html
 */

const bullish = '#22b554';
const bearish = '#f62f2f';

export function volumeStudy(CIQ) {
	return {
		name: 'Volume Underlay',
		seriesFN: CIQ.Studies.createVolumeChart,
		calculateFN: CIQ.Studies.calculateVolume,
		inputs: {},
		outputs: {
			'Up Volume': bullish,
			'Down Volume': bearish
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
			av: bullish,
			rv: bearish
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

export function netflowStudy(CIQ) {
	return {
		name: 'Netflow',
		seriesFN: CIQ.Studies.displaySeriesAsHistogram,
		inputs: {},
		outputs: {
			av: { color: bullish, opacity: 0.5 },
			rv: { color: bearish, opacity: 0.5 }
		},
		parameters: { widthFactor: 0.95 },
		range: '0 to max',
		yAxis: {
			ground: true,
			position: 'right',
			heightFactor: 0.8
		},
		panelHeight: 150
	};
}

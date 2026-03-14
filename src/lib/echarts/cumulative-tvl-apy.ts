export const MIN_APY_CHART_VALUE = 0.01;
export const MAX_X_AXIS_RETURN = 750;
export const Y_AXIS_TOP_PADDING_RATIO = 0.1;
export const BENCHMARK_ORANGE = '#fbbf24';
export const THEME_RED_HOVER = '#c62847';
export const BENCHMARK_LINE_OPACITY = 0.75;
export const BENCHMARK_HIT_SYMBOL_SIZE = 22;
export const BENCHMARK_SAMPLE_COUNT = 96;
export const SINGLE_POINT_LOG_RANGE_FACTOR = 10;

export type BenchmarkKind = 'treasury' | 'savings';

export interface VaultPointSource {
	name: string;
	chain: string;
	chainLogoUrl?: string;
	protocol: string;
	protocolLogoUrl?: string;
	realApy: number;
	individualTvl: number;
	url: string;
}

export interface VaultChartPoint {
	value: [number, number];
	name: string;
	chain: string;
	chainLogoUrl?: string;
	protocol: string;
	protocolLogoUrl?: string;
	realApy: number;
	individualTvl: number;
	cumulativeTvl: number;
	tvlBetter: number;
	tvlLess: number;
	totalTvl: number;
	url: string;
}

export interface BenchmarkPoint {
	value: [number, number];
	benchmarkKind: BenchmarkKind;
	label: string;
	description: string;
	rate: number;
	betterTvl: number;
	worseTvl: number;
	pctBetter: string;
	pctWorse: string;
	url: string;
}

export interface BenchmarkUrls {
	treasury: string;
	savings: string;
}

export interface AxisBoundsOptions {
	logAxes: boolean;
	minApyChartValue?: number;
	maxXAxisReturn?: number;
	yAxisTopPaddingRatio?: number;
	linearXAxisCap?: number;
}

export interface AxisBounds {
	xAxisMin: number;
	xAxisMax: number;
	yAxisMin: number;
	yAxisMax: number;
}

export function escapeHtml(value: string): string {
	return value
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;')
		.replaceAll("'", '&#39;');
}

export function formatUsd(value: number): string {
	if (value >= 1_000_000_000) return `$${(value / 1_000_000_000).toFixed(1)}B`;
	if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
	if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}k`;
	return `$${value.toFixed(0)}`;
}

export function formatRate(value: number | null, digits = 1): string {
	if (value == null || !Number.isFinite(value)) return 'n/a';
	return `${value.toFixed(digits)}%`;
}

export function formatAxisPercent(value: number): string {
	if (!Number.isFinite(value)) return '';
	if (value >= 100) return `${value.toFixed(0)}%`;
	if (value >= 10) return `${value.toFixed(1).replace(/\.0$/, '')}%`;
	if (value >= 1) return `${value.toFixed(1).replace(/\.0$/, '')}%`;
	return `${value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '')}%`;
}

export function renderTooltipLogo(url: string | undefined, alt: string, size = 18): string {
	if (!url) return '';
	const safeAlt = escapeHtml(alt);
	return `<img src="${escapeHtml(url)}" alt="${safeAlt}" width="${size}" height="${size}" style="width: ${size}px; height: ${size}px; border-radius: 999px; object-fit: contain; flex: 0 0 auto;" onerror="this.style.display='none'">`;
}

export function buildCumulativeTvlPoints(sourcePoints: VaultPointSource[]): VaultChartPoint[] {
	const points: VaultChartPoint[] = [];
	let runningTvl = 0;

	for (const sourcePoint of sourcePoints) {
		runningTvl += sourcePoint.individualTvl;
		points.push({
			value: [Math.max(sourcePoint.realApy, MIN_APY_CHART_VALUE), runningTvl],
			name: sourcePoint.name,
			chain: sourcePoint.chain,
			chainLogoUrl: sourcePoint.chainLogoUrl,
			protocol: sourcePoint.protocol,
			protocolLogoUrl: sourcePoint.protocolLogoUrl,
			realApy: sourcePoint.realApy,
			individualTvl: sourcePoint.individualTvl,
			cumulativeTvl: runningTvl,
			tvlBetter: 0,
			tvlLess: 0,
			totalTvl: 0,
			url: sourcePoint.url
		});
	}

	const totalTvl = points.at(-1)?.cumulativeTvl ?? 0;
	for (const point of points) {
		point.totalTvl = totalTvl;
		point.tvlBetter = point.cumulativeTvl - point.individualTvl;
		point.tvlLess = totalTvl - point.cumulativeTvl;
	}

	return points;
}

export function getEligibleItems<T>(
	items: T[],
	options: {
		getApy: (item: T) => number | null;
		getTvl: (item: T) => number | null | undefined;
		isBlacklisted?: (item: T) => boolean;
		minTvl: number;
		maxApyThreshold: number;
	}
): T[] {
	const { getApy, getTvl, isBlacklisted, minTvl, maxApyThreshold } = options;

	return items
		.filter((item) => {
			if (isBlacklisted?.(item)) return false;
			const tvl = getTvl(item);
			if (tvl == null || tvl < minTvl) return false;
			const apy = getApy(item);
			return apy != null && apy <= maxApyThreshold;
		})
		.toSorted((left, right) => (getApy(right) ?? 0) - (getApy(left) ?? 0));
}

export function buildAxisBounds(
	points: VaultChartPoint[],
	rates: { treasuryRate: number | null; savingsRate: number | null },
	options: AxisBoundsOptions
): AxisBounds {
	const {
		logAxes,
		minApyChartValue = MIN_APY_CHART_VALUE,
		maxXAxisReturn = MAX_X_AXIS_RETURN,
		yAxisTopPaddingRatio = Y_AXIS_TOP_PADDING_RATIO,
		linearXAxisCap = 15
	} = options;

	const xValues = points.map((point) => point.realApy);
	const yValues = points.map((point) => point.value[1]);
	const highestYValue = Math.max(...yValues);
	const lowestYValue = Math.min(...yValues);
	const isSinglePoint = points.length === 1;

	if (logAxes) {
		const xAxisMax = Math.min(
			Math.max(...xValues, rates.treasuryRate ?? 0, rates.savingsRate ?? 0, minApyChartValue),
			maxXAxisReturn
		);
		if (isSinglePoint) {
			const singlePointY = highestYValue;

			return {
				xAxisMin: minApyChartValue,
				xAxisMax,
				yAxisMin: Math.max(singlePointY / SINGLE_POINT_LOG_RANGE_FACTOR, 1),
				yAxisMax: singlePointY * SINGLE_POINT_LOG_RANGE_FACTOR
			};
		}

		const yAxisMin = lowestYValue;
		const visibleChartRatio = 1 - yAxisTopPaddingRatio;
		const yAxisMax =
			highestYValue > yAxisMin
				? yAxisMin * Math.pow(highestYValue / yAxisMin, 1 / visibleChartRatio)
				: highestYValue * 1.1;

		return {
			xAxisMin: minApyChartValue,
			xAxisMax,
			yAxisMin,
			yAxisMax
		};
	}

	const xAxisMax = linearXAxisCap;
	if (isSinglePoint) {
		const singlePointY = highestYValue;
		const linearPadding = Math.max(singlePointY, 1);

		return {
			xAxisMin: 0,
			xAxisMax,
			yAxisMin: Math.max(singlePointY - linearPadding, 0),
			yAxisMax: singlePointY + linearPadding
		};
	}

	const yAxisMin = 0;
	const yAxisMax = highestYValue <= 0 ? 1 : highestYValue / (1 - yAxisTopPaddingRatio);

	return {
		xAxisMin: 0,
		xAxisMax,
		yAxisMin,
		yAxisMax
	};
}

export function buildBenchmarkPoints(
	kind: BenchmarkKind,
	rate: number,
	points: VaultChartPoint[],
	bounds: Pick<AxisBounds, 'yAxisMin' | 'yAxisMax'>,
	logAxes: boolean,
	benchmarkUrls: BenchmarkUrls
): BenchmarkPoint[] {
	let betterTvl = 0;
	let worseTvl = 0;

	for (const point of points) {
		if (point.realApy > rate) betterTvl += point.individualTvl;
		else worseTvl += point.individualTvl;
	}

	const totalTvl = betterTvl + worseTvl;
	const label = kind === 'treasury' ? 'US Treasury note rate' : 'US bank savings rate';
	const description = kind === 'treasury' ? 'The risk-free benchmark.' : 'Average yield on a US bank savings account.';
	const url = kind === 'treasury' ? benchmarkUrls.treasury : benchmarkUrls.savings;

	return Array.from({ length: BENCHMARK_SAMPLE_COUNT }, (_, index) => {
		const ratio = index / Math.max(BENCHMARK_SAMPLE_COUNT - 1, 1);
		const yValue = logAxes
			? bounds.yAxisMin * Math.pow(bounds.yAxisMax / bounds.yAxisMin, ratio)
			: bounds.yAxisMin + (bounds.yAxisMax - bounds.yAxisMin) * ratio;

		return {
			value: [rate, yValue] as [number, number],
			benchmarkKind: kind,
			label,
			description,
			rate,
			betterTvl,
			worseTvl,
			pctBetter: totalTvl > 0 ? ((betterTvl / totalTvl) * 100).toFixed(1) : '0.0',
			pctWorse: totalTvl > 0 ? ((worseTvl / totalTvl) * 100).toFixed(1) : '0.0',
			url
		};
	});
}

import logoSvg from '$lib/assets/logo-horizontal.svg?raw';

type WatermarkCorner = 'top-left' | 'top-right';
type WatermarkInset = 'default' | 'relaxed';

interface WatermarkGrid {
	top: number;
	right: number;
	left: number;
}

interface BuildChartWatermarkGraphicParams {
	corner: WatermarkCorner | null | undefined;
	grid: WatermarkGrid;
	isMobile: boolean;
	inset?: WatermarkInset;
	opacity?: number;
}

const desktopWatermarkWidth = 224;
const mobileWatermarkWidth = 176;
const watermarkAspectRatio = 314 / 60;
const chartWatermarkUrl = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(
	logoSvg.replace('fill="#0B0B14"', 'fill="#d5deea"')
)}`;

function getWatermarkInset(isMobile: boolean, inset: WatermarkInset) {
	if (inset === 'relaxed') {
		return isMobile ? 16 : 20;
	}

	return isMobile ? 10 : 12;
}

export function buildChartWatermarkGraphic({
	corner,
	grid,
	isMobile,
	inset = 'default',
	opacity = 0.07
}: BuildChartWatermarkGraphicParams) {
	if (!corner) return undefined;

	const innerInset = getWatermarkInset(isMobile, inset);
	const width = isMobile ? mobileWatermarkWidth : desktopWatermarkWidth;
	const height = width / watermarkAspectRatio;

	return {
		elements: [
			{
				type: 'image' as const,
				id: 'chart-watermark',
				silent: true,
				z: -10,
				top: grid.top + innerInset,
				...(corner === 'top-left' ? { left: grid.left + innerInset } : { right: grid.right + innerInset }),
				style: {
					image: chartWatermarkUrl,
					width,
					height,
					opacity
				}
			}
		]
	};
}

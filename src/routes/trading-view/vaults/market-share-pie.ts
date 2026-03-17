export const MARKET_SHARE_OTHER_THRESHOLD = 0.02;
export const MARKET_SHARE_OTHER_COLOR = '#ffffff';
export const MARKET_SHARE_OTHER_STRIPE_COLOR = 'rgba(15, 23, 42, 0.45)';

export interface MarketShareChartItem {
	slug: string;
	label: string;
	name: string;
	tvl: number;
	avgApy: number | null;
	logoUrl?: string;
	href: string;
}

export interface MarketSharePieSlice {
	name: string;
	label: string;
	value: number;
	tvl: number;
	avgApy: number | null;
	percentage: number;
	logoUrl?: string;
	url?: string;
	slug?: string;
	isOther: boolean;
	memberCount?: number;
	itemStyle?: {
		color: string;
		decal?: {
			symbol: string;
			dashArrayX: number[];
			dashArrayY: number[];
			rotation: number;
			color: string;
			backgroundColor: string;
		};
	};
}

interface BuildMarketSharePieOptions {
	otherThreshold?: number;
	groupLabelPlural?: string;
}

function calculateWeightedApy(items: MarketShareChartItem[]): number | null {
	let weightedSum = 0;
	let tvlSum = 0;

	for (const item of items) {
		if (item.avgApy == null || item.tvl <= 0) continue;
		weightedSum += item.tvl * item.avgApy;
		tvlSum += item.tvl;
	}

	return tvlSum > 0 ? weightedSum / tvlSum : null;
}

function buildOtherName(groupLabelPlural: string): string {
	return `Other ${groupLabelPlural.toLowerCase()}`;
}

export function buildMarketSharePieSlices(
	items: MarketShareChartItem[],
	options: BuildMarketSharePieOptions = {}
): MarketSharePieSlice[] {
	const { otherThreshold = MARKET_SHARE_OTHER_THRESHOLD, groupLabelPlural = 'items' } = options;
	const chartableItems = items.filter((item) => item.tvl > 0).toSorted((a, b) => b.tvl - a.tvl);
	const totalTvl = chartableItems.reduce((sum, item) => sum + item.tvl, 0);

	if (totalTvl <= 0) return [];

	const visibleSlices: MarketSharePieSlice[] = [];
	const otherMembers: MarketShareChartItem[] = [];

	for (const item of chartableItems) {
		const percentage = item.tvl / totalTvl;
		if (percentage < otherThreshold) {
			otherMembers.push(item);
			continue;
		}

		visibleSlices.push({
			name: item.name,
			label: item.label,
			value: item.tvl,
			tvl: item.tvl,
			avgApy: item.avgApy,
			percentage: percentage * 100,
			logoUrl: item.logoUrl,
			url: item.href,
			slug: item.slug,
			isOther: false
		});
	}

	if (otherMembers.length > 0) {
		const otherTvl = otherMembers.reduce((sum, item) => sum + item.tvl, 0);
		visibleSlices.push({
			name: buildOtherName(groupLabelPlural),
			label: 'Other',
			value: otherTvl,
			tvl: otherTvl,
			avgApy: calculateWeightedApy(otherMembers),
			percentage: (otherTvl / totalTvl) * 100,
			isOther: true,
			memberCount: otherMembers.length,
			itemStyle: {
				color: MARKET_SHARE_OTHER_COLOR,
				decal: {
					symbol: 'rect',
					dashArrayX: [1, 0],
					dashArrayY: [4, 4],
					rotation: 0,
					color: MARKET_SHARE_OTHER_STRIPE_COLOR,
					backgroundColor: MARKET_SHARE_OTHER_COLOR
				}
			}
		});
	}

	return visibleSlices.toSorted((a, b) => b.tvl - a.tvl);
}

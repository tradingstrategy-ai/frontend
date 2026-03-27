import type { VaultInfo } from './schemas';

export const DEFAULT_RETURN_COLUMN_IDS = ['1m-ann', '3m-ann', 'lifetime-abs'] as const;

export type ReturnColumnId =
	| '1m-ann'
	| '1m-abs'
	| '3m-ann'
	| '3m-abs'
	| '6m-ann'
	| '6m-abs'
	| '1y-ann'
	| '1y-abs'
	| 'lifetime-ann'
	| 'lifetime-abs';

export type LegacyReturnSortKey = 'one_month_return_ann' | 'three_months_return_ann' | 'lifetime_return';

export const LEGACY_RETURN_SORT_ALIASES: Record<LegacyReturnSortKey, ReturnColumnId> = {
	one_month_return_ann: '1m-ann',
	three_months_return_ann: '3m-ann',
	lifetime_return: 'lifetime-ann'
};

export interface ReturnMetricValues {
	net: number | null;
	gross: number | null;
}

export interface ReturnColumnDefinition {
	id: ReturnColumnId;
	label: string;
	headerLabel: string;
	shortLabel: string;
	sortDirection: 'desc';
	showAnnualisedTooltip: boolean;
	getValues(vault: VaultInfo): ReturnMetricValues;
}

function getPeriodResult(vault: VaultInfo, period: string) {
	return vault.period_results.find((item) => item.period.toLowerCase() === period);
}

function getTopLevelValues(vault: VaultInfo, netKey: keyof VaultInfo, grossKey: keyof VaultInfo): ReturnMetricValues {
	return {
		net: (vault[netKey] as number | null) ?? null,
		gross: (vault[grossKey] as number | null) ?? null
	};
}

function getPeriodValues(vault: VaultInfo, period: '6m' | '1y', type: 'ann' | 'abs'): ReturnMetricValues {
	const result = getPeriodResult(vault, period);
	if (!result) {
		return { net: null, gross: null };
	}

	if (type === 'ann') {
		return {
			net: result.cagr_net,
			gross: result.cagr_gross
		};
	}

	return {
		net: result.returns_net,
		gross: result.returns_gross
	};
}

export const returnColumnDefinitions = [
	{
		id: '1m-ann',
		label: 'One month annualised',
		shortLabel: '1M ann.',
		headerLabel: '1M<br/>return ann.',
		sortDirection: 'desc',
		showAnnualisedTooltip: true,
		getValues: (vault) => getTopLevelValues(vault, 'one_month_cagr_net', 'one_month_cagr')
	},
	{
		id: '1m-abs',
		label: 'One month absolute',
		shortLabel: '1M abs',
		headerLabel: '1M<br/>return abs.',
		sortDirection: 'desc',
		showAnnualisedTooltip: false,
		getValues: (vault) => getTopLevelValues(vault, 'one_month_returns_net', 'one_month_returns')
	},
	{
		id: '3m-ann',
		label: 'Three months annualised',
		shortLabel: '3M ann.',
		headerLabel: '3M<br/>return ann.',
		sortDirection: 'desc',
		showAnnualisedTooltip: true,
		getValues: (vault) => getTopLevelValues(vault, 'three_months_cagr_net', 'three_months_cagr')
	},
	{
		id: '3m-abs',
		label: 'Three months absolute',
		shortLabel: '3M abs',
		headerLabel: '3M<br/>return abs.',
		sortDirection: 'desc',
		showAnnualisedTooltip: false,
		getValues: (vault) => getTopLevelValues(vault, 'three_months_returns_net', 'three_months_returns')
	},
	{
		id: '6m-ann',
		label: 'Six months annualised',
		shortLabel: '6M ann.',
		headerLabel: '6M<br/>return ann.',
		sortDirection: 'desc',
		showAnnualisedTooltip: true,
		getValues: (vault) => getPeriodValues(vault, '6m', 'ann')
	},
	{
		id: '6m-abs',
		label: 'Six months absolute',
		shortLabel: '6M abs',
		headerLabel: '6M<br/>return abs.',
		sortDirection: 'desc',
		showAnnualisedTooltip: false,
		getValues: (vault) => getPeriodValues(vault, '6m', 'abs')
	},
	{
		id: '1y-ann',
		label: 'One year annualised',
		shortLabel: '1Y ann.',
		headerLabel: '1Y<br/>return ann.',
		sortDirection: 'desc',
		showAnnualisedTooltip: true,
		getValues: (vault) => getPeriodValues(vault, '1y', 'ann')
	},
	{
		id: '1y-abs',
		label: 'One year absolute',
		shortLabel: '1Y abs',
		headerLabel: '1Y<br/>return abs.',
		sortDirection: 'desc',
		showAnnualisedTooltip: false,
		getValues: (vault) => getPeriodValues(vault, '1y', 'abs')
	},
	{
		id: 'lifetime-ann',
		label: 'Lifetime annualised',
		shortLabel: 'Lifetime ann.',
		headerLabel: 'Lifetime<br/>return ann.',
		sortDirection: 'desc',
		showAnnualisedTooltip: false,
		getValues: (vault) => getTopLevelValues(vault, 'cagr_net', 'cagr')
	},
	{
		id: 'lifetime-abs',
		label: 'Lifetime absolute',
		shortLabel: 'Lifetime abs',
		headerLabel: 'Lifetime<br/>return abs.',
		sortDirection: 'desc',
		showAnnualisedTooltip: false,
		getValues: (vault) => getTopLevelValues(vault, 'lifetime_return_net', 'lifetime_return')
	}
] as const satisfies readonly ReturnColumnDefinition[];

export const returnColumnDefinitionMap: Record<ReturnColumnId, ReturnColumnDefinition> = Object.fromEntries(
	returnColumnDefinitions.map((definition) => [definition.id, definition])
) as Record<ReturnColumnId, ReturnColumnDefinition>;

export function isReturnColumnId(value: string): value is ReturnColumnId {
	return value in returnColumnDefinitionMap;
}

export function isReturnSortKey(value: string): value is ReturnColumnId | LegacyReturnSortKey {
	return isReturnColumnId(value) || value in LEGACY_RETURN_SORT_ALIASES;
}

export function canonicaliseReturnSortKey(value: string): ReturnColumnId | null {
	if (isReturnColumnId(value)) {
		return value;
	}

	if (value in LEGACY_RETURN_SORT_ALIASES) {
		return LEGACY_RETURN_SORT_ALIASES[value as LegacyReturnSortKey];
	}

	return null;
}

export function sanitiseReturnColumnSelection(value: string | ReturnColumnId[] | null | undefined): ReturnColumnId[] {
	if (value == null) {
		return [...DEFAULT_RETURN_COLUMN_IDS];
	}

	const rawValues = Array.isArray(value) ? value : value.split(',').map((item) => item.trim());
	const selected = rawValues.filter(isReturnColumnId).filter((item, index, list) => list.indexOf(item) === index);

	if (selected.length > 0) {
		return selected.slice(0, 3);
	}

	if (Array.isArray(value)) {
		return [];
	}

	return value === '' ? [] : [...DEFAULT_RETURN_COLUMN_IDS];
}

export function serialiseReturnColumnSelection(value: ReturnColumnId[]): string {
	return sanitiseReturnColumnSelection(value).join(',');
}

export function toggleReturnColumnSelection(value: ReturnColumnId[], id: ReturnColumnId): ReturnColumnId[] {
	if (value.includes(id)) {
		return value.filter((item) => item !== id);
	}

	if (value.length < 3) {
		return [...value, id];
	}

	return [...value.slice(0, 2), id];
}

export function getReturnColumnValues(vault: VaultInfo, id: ReturnColumnId): ReturnMetricValues {
	return returnColumnDefinitionMap[id].getValues(vault);
}

export function getEffectiveReturnValue(vault: VaultInfo, id: ReturnColumnId): number | null {
	const values = getReturnColumnValues(vault, id);
	return values.net ?? values.gross;
}

export function compareVaultsByReturn(id: ReturnColumnId) {
	return (a: VaultInfo, b: VaultInfo) => {
		const aValue = getEffectiveReturnValue(a, id) ?? -Infinity;
		const bValue = getEffectiveReturnValue(b, id) ?? -Infinity;
		return aValue - bValue;
	};
}

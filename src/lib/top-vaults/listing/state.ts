import type { VaultListingQuery, VaultSortDirection } from './query';
import {
	DEFAULT_RETURN_COLUMN_IDS,
	LEGACY_RETURN_SORT_ALIASES,
	canonicaliseReturnSortKey,
	returnColumnDefinitions
} from '../return-columns';
import {
	ageFilterOptions,
	ddFilterOptions,
	monthlyReturnFilterOptions,
	riskFilterOptions,
	tvlFilterOptions
} from '../helpers';

const sortKeys = new Set([
	...returnColumnDefinitions.map((definition) => definition.id),
	...Object.keys(LEGACY_RETURN_SORT_ALIASES),
	'chain',
	'vault',
	'three_months_sharpe',
	'three_months_volatility',
	'max_dd',
	'denomination',
	'tvl',
	'age',
	'fees',
	'lockup',
	'risk'
]);

/** Defaults applied before a listing URL query is parsed. */
export interface VaultListingQueryDefaults {
	tvl?: string;
	age?: number;
	risk?: number;
	sort?: string;
	direction?: VaultSortDirection;
	unknown?: boolean;
	mr?: string;
}

function boundedIndex(value: string | null, fallback: number, max: number): number {
	if (value == null) return fallback;
	const parsed = Number(value);
	return Number.isInteger(parsed) && parsed >= 0 && parsed < max ? parsed : fallback;
}

/** Parse and canonicalise the URL state understood by server and browser. */
export function parseVaultListingQuery(
	params: URLSearchParams,
	defaults: VaultListingQueryDefaults = {}
): VaultListingQuery {
	const rawSort = params.get('sort') ?? defaults.sort ?? DEFAULT_RETURN_COLUMN_IDS[0];
	const sort = canonicaliseReturnSortKey(rawSort) ?? rawSort;
	const direction = params.get('direction');
	return {
		tvl: tvlFilterOptions.some((item) => item.key === params.get('tvl'))
			? params.get('tvl')!
			: (defaults.tvl ?? tvlFilterOptions[0].key),
		age: boundedIndex(params.get('age'), defaults.age ?? 0, ageFilterOptions.length),
		risk: boundedIndex(params.get('risk'), defaults.risk ?? 1, riskFilterOptions.length),
		dd: ddFilterOptions.some((item) => item.key === params.get('dd')) ? params.get('dd')! : 'any',
		mr: monthlyReturnFilterOptions.some((item) => item.key === params.get('mr'))
			? params.get('mr')!
			: (defaults.mr ?? 'any'),
		q: (params.get('q') ?? '').slice(0, 100),
		closed: params.get('closed') === '1',
		unknown: params.get('unknown') == null ? (defaults.unknown ?? true) : params.get('unknown') === '1',
		sort: sortKeys.has(sort) ? sort : (defaults.sort ?? DEFAULT_RETURN_COLUMN_IDS[0]),
		direction: direction === 'asc' || direction === 'desc' ? direction : (defaults.direction ?? 'desc')
	};
}

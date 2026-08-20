import { DEFAULT_RETURN_COLUMN_IDS, canonicaliseReturnSortKey, type ReturnColumnId } from './return-columns';

const returnSortDescriptions: Record<ReturnColumnId, string> = {
	'1m-ann': '30-day returns',
	'1m-abs': '30-day absolute returns',
	'3m-ann': 'three-month annualised returns',
	'3m-abs': 'three-month absolute returns',
	'6m-ann': 'six-month annualised returns',
	'6m-abs': 'six-month absolute returns',
	'1y-ann': 'one-year annualised returns',
	'1y-abs': 'one-year absolute returns',
	'lifetime-ann': 'lifetime annualised returns',
	'lifetime-abs': 'lifetime absolute returns'
};

const tableSortDescriptions: Record<string, string> = {
	chain: 'blockchain',
	vault: 'vault name',
	provider_risk_rating: 'risk rating',
	three_months_sharpe: 'three-month Sharpe ratio',
	three_months_volatility: 'three-month volatility',
	max_dd: 'maximum drawdown',
	denomination: 'denomination',
	tvl: 'total value locked',
	age: 'age',
	fees: 'fees',
	lockup: 'deposit delay',
	risk: 'protocol technical risk'
};

/**
 * Return the human-readable metric currently used to rank a vault table.
 *
 * @param sort - Sort key encoded in the vault-listing URL.
 */
export function getVaultSortDescription(sort: string | null): string {
	const canonicalReturnSort = sort && canonicaliseReturnSortKey(sort);
	if (canonicalReturnSort) {
		return returnSortDescriptions[canonicalReturnSort];
	}

	return tableSortDescriptions[sort ?? ''] ?? returnSortDescriptions[DEFAULT_RETURN_COLUMN_IDS[0]];
}
